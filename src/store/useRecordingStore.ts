import { create } from "zustand";
import {
  uploadAudioChunk,
  finishRecording,
  startRecording as apiStartRecording,
  deleteSTT,
} from "../stt/api/sttApi";
import type { STT } from "../stt/type/type";

export type RecordingStatus =
  | "idle"
  | "recording"
  | "paused"
  | "encoding"
  | "finished";

// This will hold the non-serializable parts of a recording session
interface RecordingSession {
  stt: STT;
  mediaRecorder: MediaRecorder;
  mediaStream: MediaStream;
  audioChunks: Blob[];
  recordTimeTimer: number;
  chunkTimer: number;
}

// This is the reactive state that components will subscribe to
export interface SessionState {
  sttId: number;
  recordingStatus: RecordingStatus;
  recordingTime: number;
}

// Module-level map to hold active sessions with their resources
const sessions = new Map<number, RecordingSession>();

// Zustand store state
interface RecordingState {
  sessionStates: Map<number, SessionState>;
  clear: () => void;
  isAnyRecordingActive: () => boolean;
  startRecording: (meetingId: string) => Promise<STT | null>;
  pauseRecording: (sttId: number) => void;
  resumeRecording: (sttId: number) => void;
  stopRecording: (sttId: number) => Promise<void>;
  confirmUpload: (sttId: number) => Promise<STT | null>;
  cancelRecording: (sttId: number) => Promise<void>;
  getSessionState: (sttId: number) => SessionState | undefined;
  handleLastChunk: () => Promise<void>;
  getActiveRecordingDetails: () => (SessionState & { meetingId: string }) | null;
}

const useRecordingStore = create<RecordingState>((set, get) => {
  const cleanupSession = (sttId: number) => {
    const session = sessions.get(sttId);
    if (session) {
      clearInterval(session.recordTimeTimer);
      clearInterval(session.chunkTimer);
      if (session.mediaRecorder && session.mediaRecorder.state !== "inactive") {
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
      return state; // Return original state if no change
    });
    console.log(`Recording resources cleaned up for STT ID: ${sttId}`);
  };

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
          if (session.mediaRecorder && session.mediaRecorder.state !== "inactive") {
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
          return state; // Return original state if no change
        });
        console.log(`Recording resources cleaned up for STT ID: ${sttId}`);
      })
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

    startRecording: async (meetingId: string): Promise<STT | null> => {
      if (get().isAnyRecordingActive()) {
        console.warn("Another recording is already in progress.");
        alert("다른 녹음이 진행 중입니다.");
        return null;
      }

      let newStt: STT;
      try {
        newStt = await apiStartRecording(meetingId);
      } catch (error) {
        console.error("Failed to start recording session on API:", error);
        alert("녹음 세션을 시작하지 못했습니다.");
        return null;
      }

      const sttId = newStt.id;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const recorder = new MediaRecorder(stream);

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
            updateSessionState(sttId, { recordingTime: state.recordingTime + 1 });
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
          if(onStopSession) {
            clearInterval(onStopSession.recordTimeTimer);
            clearInterval(onStopSession.chunkTimer);
            updateSessionState(sttId, { recordingStatus: "encoding" });
          }
        };

        recorder.start(1000);

        return newStt;
      } catch (error) {
        alert(
          "마이크 권한이 없습니다. 권한 허용 후 다시 시도해주세요. \n(모바일의 경우 앱 설정에서 브라우저 마이크 권한 설정)"
        );
        cleanupSession(sttId);
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

    stopRecording: async (sttId: number) => {
      const session = sessions.get(sttId);
      if (session && session.mediaRecorder.state !== "inactive") {
        session.mediaRecorder.stop();

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
            await uploadAudioChunk(sttId, formData);
            updateSessionState(sttId, { recordingStatus: "finished" });
          } catch (e) {
            console.error("Final chunk upload failed:", e);
            alert("네트워크가 불안정합니다. 확인 후 재시도바랍니다.");
            cleanupSession(sttId);
          }
        } else {
          updateSessionState(sttId, { recordingStatus: "finished" });
        }
      }
    },

    confirmUpload: async (sttId: number): Promise<STT | null> => {
      try {
        const resStt = await finishRecording(sttId);
        cleanupSession(sttId);
        return resStt;
      } catch (e) {
        console.error("Final conversion request failed:", e);
        return null;
      }
    },

    cancelRecording: async (sttId: number) => {
      cleanupSession(sttId);
      try {
        // This is an API call to delete from the backend
        await deleteSTT(sttId);
      } catch (error) {
        console.error("Failed to delete STT on cancel:", error);
      }
    },

    handleLastChunk: async () => {
      const { sessionStates, stopRecording } = get();
      let activeSttId: number | null = null;
  
      for (const sessionState of sessionStates.values()) {
        if (sessionState.recordingStatus === "recording" || sessionState.recordingStatus === "paused") {
          activeSttId = sessionState.sttId;
          break;
        }
      }
  
      if (activeSttId !== null) {
        console.log(`Handling last chunk for active recording session: ${activeSttId}`);
        await stopRecording(activeSttId);
      }
    },

    getActiveRecordingDetails: () => {
      const { sessionStates } = get();
      for (const sessionState of sessionStates.values()) {
        if (sessionState.recordingStatus === "recording" || sessionState.recordingStatus === "paused") {
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
  };
});

export default useRecordingStore;