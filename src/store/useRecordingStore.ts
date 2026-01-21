import { create } from "zustand";
import { finishRecording, startRecording as apiStartRecording, deleteSTT, uploadAudioChunk, } from "../stt/api/sttApi";
import type { STT } from "../stt/type/type";
import useWebSocketStore from "./useWebSocketStore";

/**
 * 녹음 상태를 나타내는 타입.
 * - idle: 대기 중
 * - recording: 녹음 중
 * - paused: 일시정지
 * - encoding: 녹음 종료 후 서버에서 파일 처리 중
 * - finished: 모든 과정 완료
 */
export type RecordingStatus = | "idle" | "recording" | "paused" | "encoding" | "finished";

/**
 * 직렬화할 수 없는 브라우저 API 관련 객체들을 저장하는 인터페이스.
 * (MediaRecorder, MediaStream 등)
 * 이 객체들은 Zustand 스토어 외부에 모듈 레벨 `sessions` Map으로 관리됩니다.
 */
interface RecordingSession {
  stt: STT;
  mediaRecorder: MediaRecorder;
  mediaStream: MediaStream;
  audioChunks: Blob[];
  recordTimeTimer: number; // 녹음 시간 타이머 ID
  chunkTimer: number; // 주기적 업로드 타이머 ID
}

/**
 * React 컴포넌트에서 구독할 수 있는, 직렬화 가능한 상태 인터페이스.
 * Zustand 스토어에 저장되어 UI 반응성을 담당합니다.
 */
export interface SessionState {
  sttId: number;
  recordingStatus: RecordingStatus;
  recordingTime: number;
}

// 모듈 레벨에서 활성 녹음 세션(비직렬화 객체)을 관리하는 Map.
const sessions = new Map<number, RecordingSession>();

/**
 * Zustand 스토어의 전체 상태 및 액션 인터페이스.
 */
interface RecordingState {
  // 각 녹음 세션의 ID와 상태를 매핑하는 Map. UI 렌더링에 사용됩니다.
  sessionStates: Map<number, SessionState>;
  /** 페이지 이동 또는 비정상 종료 시 모든 활성 녹음 세션을 정리합니다. */
  clear: () => void;
  /** 현재 진행 중(녹음 또는 일시정지)인 세션이 있는지 확인합니다. */
  isAnyRecordingActive: () => boolean;
  /**
   * 새로운 녹음을 시작합니다.
   * @param meetingId 녹음을 연결할 회의 ID
   * @returns 생성된 STT 객체 또는 실패 시 null
   */
  startRecording: (meetingId: string) => Promise<STT | null>;
  /**
   * 지정된 ID의 녹음을 일시정지합니다.
   * @param sttId 일시정지할 STT ID
   */
  pauseRecording: (sttId: number) => void;
  /**
   * 일시정지된 녹음을 재개합니다.
   * @param sttId 재개할 STT ID
   */
  resumeRecording: (sttId: number) => void;
  /**
   * 녹음을 종료하고 마지막 오디오 청크를 서버로 전송합니다.  
   * @param sttId 종료할 STT ID
   * @returns 최종 STT 객체 또는 실패 시 null
   */
  stopRecording: (sttId: number) => Promise<STT | null>;
  /**
   * 녹음 파일의 후처리가 완료된 후, 실제 STT 변환을 시작하도록 서버에 요청합니다.
   * @param sttId STT 변환을 시작할 STT ID
   */
  confirmUpload: (sttId: number) => Promise<STT | null>;
  /**
   * 녹음 세션을 취소하고 관련 리소스 및 서버 데이터를 정리합니다.
   * @param sttId 취소할 STT ID
   */
  cancelRecording: (sttId: number) => Promise<void>;
  /** 지정된 STT ID의 현재 상태를 가져옵니다. */
  getSessionState: (sttId: number) => SessionState | undefined;
  /** 지정된 STT ID의 녹음 시간을 가져옵니다. */
  getRecordingTime: (sttId: number) => number;
  /** 페이지 이탈 시 마지막 오디오 청크를 처리합니다. */
  handleLastChunk: () => Promise<void>;
  /** 현재 활성 녹음 세션의 상세 정보를 가져옵니다. (UI 표시용) */
  getActiveRecordingDetails: () => (SessionState & { meetingId: string }) | null;
}

/**
 * 실시간 음성 녹음 상태 관리를 위한 Zustand 스토어.
 */
const useRecordingStore = create<RecordingState>((set, get) => {
  const useWebSocket = useWebSocketStore.getState();

  /**
   * 특정 녹음 세션의 모든 리소스(타이머, 미디어 스트림 등)를 정리하고 스토어에서 제거합니다.
   * @param sttId 정리할 STT ID
   */
  const cleanupSession = (sttId: number) => {
    const session = sessions.get(sttId);
    if (session) {
      clearInterval(session.recordTimeTimer);
      clearInterval(session.chunkTimer);
      if (
        session.mediaRecorder &&
        session.mediaRecorder.state !== "inactive"
      ) {
        session.mediaRecorder.stop();
      }
      session.mediaStream.getTracks().forEach((track) => track.stop());
      sessions.delete(sttId);
    }

    set((state) => {
      const newSessionStates = new Map(state.sessionStates);
      if (newSessionStates.has(sttId)) {
        newSessionStates.delete(sttId);
        return { sessionStates: newSessionStates };
      }
      return state;
    });
    console.log(`Recording resources cleaned up for STT ID: ${sttId}`);
  };

  /**
   * 특정 녹음 세션의 상태(UI용)를 업데이트합니다.
   * @param sttId 업데이트할 STT ID
   * @param props 업데이트할 속성 객체
   */
  const updateSessionState = (sttId: number, props: Partial<SessionState>) => {
    set((state) => {
      const newSessionStates = new Map(state.sessionStates);
      const current = newSessionStates.get(sttId);
      if (current) {
        newSessionStates.set(sttId, { ...current, ...props });
        return { sessionStates: newSessionStates };
      }
      return state;
    });
  };

  return {
    sessionStates: new Map(),

    clear: () => {
      sessions.forEach((session, sttId) => {
        if (session) {
          clearInterval(session.recordTimeTimer);
          clearInterval(session.chunkTimer);
          if (
            session.mediaRecorder &&
            session.mediaRecorder.state !== "inactive"
          ) {
            session.mediaRecorder.stop();
          }
          session.mediaStream.getTracks().forEach((track) => track.stop());
          sessions.delete(sttId);
        }

        set((state) => {
          const newSessionStates = new Map(state.sessionStates);
          if (newSessionStates.has(sttId)) {
            newSessionStates.delete(sttId);
            return { sessionStates: newSessionStates };
          }
          return state;
        });
        console.log(`Recording resources cleaned up for STT ID: ${sttId}`);
      });
    },

    isAnyRecordingActive: () => {
      for (const sessionState of get().sessionStates.values()) {
        if (
          sessionState.recordingStatus === "recording" ||
          sessionState.recordingStatus === "paused"
        ) {
          return true;
        }
      }
      return false;
    },

    getSessionState: (sttId: number) => {
      return get().sessionStates.get(sttId);
    },

    getRecordingTime: (sttId: number): number => {
      return get().sessionStates.get(sttId)?.recordingTime ?? 0;
    },

    startRecording: async (meetingId: string): Promise<STT | null> => {
      if (get().isAnyRecordingActive()) {
        console.warn("Another recording is already in progress.");
        alert("다른 녹음이 진행 중입니다.");
        return null;
      }

      try {
        await useWebSocket.connect();
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const recorder = new MediaRecorder(stream);

        let newStt: STT;
        try {
          newStt = await apiStartRecording(meetingId);
        } catch (error) {
          console.error("Failed to start recording session on API:", error);
          alert("녹음 세션을 시작하지 못했습니다.");
          useWebSocket.disconnect();
          return null;
        }

        const sttId = newStt.id;

        set((state) => {
          const newSessionStates = new Map(state.sessionStates);
          newSessionStates.set(sttId, {
            sttId: sttId,
            recordingStatus: "recording",
            recordingTime: 0,
          });
          return { sessionStates: newSessionStates };
        });

        const recordTimeTimer = window.setInterval(() => {
          const state = get().sessionStates.get(sttId);
          if (state && state.recordingStatus === "recording") {
            updateSessionState(sttId, {
              recordingTime: state.recordingTime + 1,
            });
          }
        }, 1000);

        const chunkTimer = window.setInterval(async () => {
          const currentSession = sessions.get(sttId);
          const sessionState = get().sessionStates.get(sttId);
          if (
            currentSession &&
            sessionState &&
            sessionState.recordingStatus === "recording" &&
            currentSession.audioChunks.length > 0
          ) {
            const chunkToUpload = new Blob(currentSession.audioChunks, {
              type: "audio/wav",
            });
            currentSession.audioChunks = [];
            const formData = new FormData();
            formData.append("file", chunkToUpload, "chunk.wav");
            try {
              await uploadAudioChunk(sttId, formData);
            } catch (e) {
              console.error("Chunk upload failed:", e);
              alert("네트워크가 불안정합니다. 확인 후 재시도바랍니다.");
              cleanupSession(sttId);
            }
          }
        }, 10000);

        const session: RecordingSession = {
          stt: newStt,
          mediaRecorder: recorder,
          mediaStream: stream,
          audioChunks: [],
          recordTimeTimer,
          chunkTimer,
        };
        sessions.set(sttId, session);

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            sessions.get(sttId)?.audioChunks.push(event.data);
          }
        };

        recorder.onstop = () => {
          const onStopSession = sessions.get(sttId);
          if (onStopSession) {
            clearInterval(onStopSession.recordTimeTimer);
            clearInterval(onStopSession.chunkTimer);
            updateSessionState(sttId, { recordingStatus: "encoding" });
          }
        };

        recorder.start(1000);

        return newStt;
      } catch (error) {
        console.error(error);
        alert(
          "마이크 권한이 없습니다. 권한 허용 후 다시 시도해주세요. \n(모바일의 경우 앱 설정에서 브라우저 마이크 권한 설정)"
        );
        return null;
      }
    },

    pauseRecording: (sttId: number) => {
      const session = sessions.get(sttId);
      const sessionState = get().sessionStates.get(sttId);
      if (session && sessionState?.recordingStatus === "recording") {
        session.mediaRecorder.pause();
        updateSessionState(sttId, { recordingStatus: "paused" });
      }
    },

    resumeRecording: async (sttId: number) => {
      const session = sessions.get(sttId);
      const sessionState = get().sessionStates.get(sttId);
      if (session && sessionState?.recordingStatus === "paused") {
        session.mediaRecorder.resume();
        updateSessionState(sttId, { recordingStatus: "recording" });
      }
    },

    stopRecording: async (sttId: number): Promise<STT | null> => {
      const session = sessions.get(sttId);
      if (session && session.mediaRecorder.state !== "inactive") {
        session.mediaRecorder.stop();
        session.mediaStream.getTracks().forEach((track) => track.stop());

        if (session.audioChunks.length > 0) {
          const finalChunk = new Blob(session.audioChunks, {
            type: "audio/wav",
          });
          session.audioChunks = [];
          const formData = new FormData();
          formData.append("file", finalChunk, "final.wav");
          formData.append("finish", String(true));
          try {
            updateSessionState(sttId, { recordingStatus: "encoding" });
            const stt = await uploadAudioChunk(sttId, formData);
            updateSessionState(sttId, { recordingStatus: "finished" });
            return stt;
          } catch (e) {
            console.error("Final chunk upload failed:", e);
            alert("네트워크가 불안정합니다. 확인 후 재시도바랍니다.");
            cleanupSession(sttId);
          }
        } else {
          updateSessionState(sttId, { recordingStatus: "finished" });
        }
      }
      return null; // Can't return STT directly anymore
    },

    confirmUpload: async (sttId: number): Promise<STT | null> => {
      try {
        const resStt = await finishRecording(sttId);
        cleanupSession(sttId);
        useWebSocket.disconnect(); // Disconnect after confirming
        return resStt;
      } catch (e) {
        console.error("Final conversion request failed:", e);
        return null;
      }
    },

    cancelRecording: async (sttId: number) => {
      cleanupSession(sttId);
      useWebSocket.disconnect();
      try {
        await deleteSTT(sttId);
      } catch (error) {
        console.error("Failed to delete STT on cancel:", error);
      }
    },

    handleLastChunk: async () => {
      const { sessionStates, stopRecording } = get();
      let activeSttId: number | null = null;

      for (const sessionState of sessionStates.values()) {
        if (
          sessionState.recordingStatus === "recording" ||
          sessionState.recordingStatus === "paused"
        ) {
          activeSttId = sessionState.sttId;
          break;
        }
      }

      if (activeSttId !== null) {
        console.log(
          `Handling last chunk for active recording session: ${activeSttId}`
        );
        await stopRecording(activeSttId);
      }
    },

    getActiveRecordingDetails: () => {
      const { sessionStates } = get();
      for (const sessionState of sessionStates.values()) {
        if (
          sessionState.recordingStatus === "recording" ||
          sessionState.recordingStatus === "paused"
        ) {
          const session = sessions.get(sessionState.sttId);
          if (session) {
            return {
              ...sessionState,
              meetingId: session.stt.meetingId,
            };
          }
        }
      }
      return null;
    },
  }
});

export default useRecordingStore;

