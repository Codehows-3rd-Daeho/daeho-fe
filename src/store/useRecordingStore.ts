import { create } from "zustand";
import {
  uploadAudioChunk,
  finishRecording,
  startRecording as apiStartRecording,
  deleteSTT,
} from "../stt/api/sttApi";
import type { STT } from "../stt/type/type";

export type RecordingStatus = "idle" | "recording" | "paused" | "encoding" | "finished";

interface RecordingSession {
  recordTimeTimer: number;
  chunkTimer: number;
  audioChunks: Blob[];
  recordingStatus: RecordingStatus;
  sessionId: number;
}

interface RecordingState {
  stt: STT | null;
  meetingId: string | null;
  activeSessionId: number | null;
  recordingTime: number;
  mediaRecorder: MediaRecorder | null;
  mediaStream: MediaStream | null;
  startRecording: (
    meetingId: string,
    onNewStt: (stt: STT) => void
  ) => Promise<void>;
  pauseRecording: () => void;
  resumeRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  confirmUpload: (sttId: number) => Promise<STT | null>;
  cancelRecording: (sttId: number) => Promise<void>;
  isRecording: () => boolean;
  handleLastChunk: () => void;
}

// 각 녹음 세션의 리소스를 독립적으로 관리
const sessions = new Map<number, RecordingSession>();
let sessionIdCounter = 0;

const useRecordingStore = create<RecordingState>((set, get) => {
  const cleanup = (sessionId?: number) => {
    const { mediaRecorder, mediaStream } = get();

    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
    }

    if (sessionId !== undefined) {
      const session = sessions.get(sessionId);
      if (session) {
        clearInterval(session.recordTimeTimer);
        clearInterval(session.chunkTimer);
        session.audioChunks = [];
        session.recordingStatus = "idle";
        sessions.delete(sessionId);
      }
    } else {
      sessions.forEach((session) => {
        clearInterval(session.recordTimeTimer);
        clearInterval(session.chunkTimer);
        session.audioChunks = [];
        session.recordingStatus = "idle";
      });
      sessions.clear();
    }

    set({
      stt: null,
      meetingId: null,
      activeSessionId: null,
      mediaRecorder: null,
      mediaStream: null,
      recordingTime: 0,
    });
    console.log(`Recording resources cleaned up. Session ID: ${sessionId ?? 'all'}`);
  };
  
  const getActiveSession = () => {
    const { activeSessionId } = get();
    return activeSessionId !== null ? sessions.get(activeSessionId) : null;
  };

  return {
    stt: null,
    meetingId: null,
    activeSessionId: null,
    mediaRecorder: null,
    mediaStream: null,
    recordingTime: 0,

    getSessionStatus: (sessionId: number) => {
      const session = sessions.get(sessionId);
      return session?.recordingStatus ?? "idle";
    },

    isRecording: () => {
      const activeSession = getActiveSession();
      return !!(activeSession && 
        (activeSession.recordingStatus === "recording" || 
         activeSession.recordingStatus === "paused"));
    },

    startRecording: async (meetingId, onNewStt) => {
      if (get().isRecording()) {
        console.warn("Recording already in progress.");
        return;
      }

      const currentSessionId = ++sessionIdCounter;
      const session: RecordingSession = {
        recordTimeTimer: 0,
        chunkTimer: 0,
        audioChunks: [],
        recordingStatus: "recording",
        sessionId: currentSessionId,
      };
      sessions.set(currentSessionId, session);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const newStt = await apiStartRecording(meetingId);
        onNewStt(newStt);

        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            session.audioChunks.push(event.data);
          }
        };

        recorder.onstop = () => {
          const currentSession = sessions.get(currentSessionId);
          if (currentSession) {
            clearInterval(currentSession.recordTimeTimer);
            clearInterval(currentSession.chunkTimer);
            currentSession.recordingStatus = "encoding";
          }
        };

        recorder.start(1000);

        session.recordTimeTimer = window.setInterval(() => {
          set((state) => ({ recordingTime: state.recordingTime + 1 }));
        }, 1000);

        session.chunkTimer = window.setInterval(async () => {
          const currentSession = sessions.get(currentSessionId);
          if (currentSession && 
              currentSession.audioChunks.length > 0 && 
              get().stt && 
              currentSession.recordingStatus === "recording") {
            const chunk = new Blob(currentSession.audioChunks, { type: "audio/wav" });
            currentSession.audioChunks = [];
            const formData = new FormData();
            formData.append("file", chunk, "chunk.wav");
            try {
              await uploadAudioChunk(get().stt!.id, formData);
            } catch (e) {
              console.error("Chunk upload failed:", e);
              alert("네트워크가 불안정합니다. 확인 후 재시도바랍니다.");
              cleanup(currentSessionId);
            }
          }
        }, 10000);

        set({
          stt: newStt,
          meetingId: meetingId,
          activeSessionId: currentSessionId,
          mediaRecorder: recorder,
          mediaStream: stream,
        });
      } catch (error) {
        alert(
          "마이크 권한이 없습니다. 권한 허용 후 다시 시도해주세요. \n(모바일의 경우 앱 설정에서 브라우저 마이크 권한 설정)"
        );
        cleanup(currentSessionId);
      }
    },

    pauseRecording: () => {
      const activeSession = getActiveSession();
      if (activeSession && activeSession.recordingStatus === "recording") {
        const { mediaRecorder } = get();
        if (mediaRecorder && mediaRecorder.state === "recording") {
          mediaRecorder.pause();
          
          clearInterval(activeSession.recordTimeTimer);
          clearInterval(activeSession.chunkTimer);
          activeSession.recordingStatus = "paused";
        }
      }
    },

    resumeRecording: async () => {
      const activeSession = getActiveSession();
      if (activeSession && activeSession.recordingStatus === "paused") {
        const { mediaRecorder, stt } = get();
        if (mediaRecorder && mediaRecorder.state === "paused") {
          mediaRecorder.resume();

          activeSession.recordTimeTimer = window.setInterval(() => {
            set((state) => ({ recordingTime: state.recordingTime + 1 }));
          }, 1000);

          activeSession.chunkTimer = window.setInterval(async () => {
            const session = sessions.get(activeSession.sessionId);
            if (session && session.audioChunks.length > 0 && stt && session.recordingStatus === "recording") {
              const chunk = new Blob(session.audioChunks, { type: "audio/wav" });
              session.audioChunks = [];
              const formData = new FormData();
              formData.append("file", chunk, "chunk.wav");
              try {
                await uploadAudioChunk(stt.id, formData);
              } catch (e) {
                console.error("Chunk upload failed:", e);
                alert("네트워크가 불안정합니다. 확인 후 재시도바랍니다.");
                cleanup(activeSession.sessionId);
              }
            }
          }, 10000);
          
          activeSession.recordingStatus = "recording";
        }
      }
    },

    stopRecording: async () => {
      const { mediaRecorder, stt } = get();
      const activeSession = getActiveSession();
      
      if (mediaRecorder && mediaRecorder.state !== "inactive" && activeSession) {
        mediaRecorder.stop();

        if (activeSession.audioChunks.length > 0 && stt) {
          const finalChunk = new Blob(activeSession.audioChunks, { type: "audio/wav" });
          activeSession.audioChunks = [];
          const formData = new FormData();
          formData.append("file", finalChunk, "final.wav");
          formData.append("finish", String(true));
          try {
            set({ activeSessionId: activeSession.sessionId }); // 상태 업데이트
            activeSession.recordingStatus = "encoding";
            await uploadAudioChunk(stt.id, formData);
            activeSession.recordingStatus = "finished";
          } catch (e) {
            console.error("Final chunk upload failed:", e);
            alert("네트워크가 불안정합니다. 확인 후 재시도바랍니다.");
          } finally {
            cleanup(activeSession.sessionId);
          }
        } else {
          cleanup(activeSession.sessionId);
        }
      }
    },

    confirmUpload: async (sttId: number) => {
      try {
        const resStt = await finishRecording(sttId);
        cleanup(); // 모든 세션 정리
        return resStt;
      } catch (e) {
        console.error("Final conversion request failed:", e);
        return null;
      }
    },

    cancelRecording: async (sttId: number) => {
      try {
        await deleteSTT(sttId);
      } catch (error) {
        console.error("Failed to delete STT on cancel:", error);
      }
      cleanup(); // 모든 세션 정리
    },

    handleLastChunk: async () => {
      const { mediaRecorder, stt } = get();
      const activeSession = getActiveSession();
      
      if (mediaRecorder && mediaRecorder.state !== "inactive" && activeSession) {
        mediaRecorder.stop();

        if (activeSession.audioChunks.length > 0 && stt) {
          const finalChunk = new Blob(activeSession.audioChunks, { type: "audio/wav" });
          activeSession.audioChunks = [];
          const formData = new FormData();
          formData.append("file", finalChunk, "final.wav");
          formData.append("finish", String(true));
          try {
            await uploadAudioChunk(stt.id, formData);
            activeSession.recordingStatus = "finished";
          } catch (e) {
            console.error("Final chunk upload failed:", e);
            alert("네트워크가 불안정합니다. 확인 후 재시도바랍니다.");
          }
        }
        cleanup(activeSession.sessionId);
      }
    },
  };
});

export default useRecordingStore;