import { create } from "zustand";
import {
  uploadAudioChunk,
  finishRecording,
  startRecording as apiStartRecording,
  deleteSTT,
} from "../stt/api/sttApi";
import type { STT } from "../stt/type/type";

export type RecordingStatus = "idle" | "recording" | "paused" | "encoding" | "finished";

interface RecordingState {
  stt: STT | null;
  meetingId: string | null;
  recordingStatus: RecordingStatus;
  recordingTime: number;
  mediaRecorder: MediaRecorder | null;
  mediaStream: MediaStream | null;
  startRecording: (
    meetingId: string,
    onNewStt: (stt: STT) => void
  ) => Promise<void>;
  pauseRecording: () => void;
  resumeRecording: () => Promise<void>;
  stopRecording: () => void;
  confirmUpload: (sttId: number) => Promise<STT | null>;
  cancelRecording: (sttId: number) => Promise<void>;
  isRecording: () => boolean;
  handleLastChunk: () => void;
}

let recordTimeTimer: number | null = null;
let chunkTimer: number | null = null;
let audioChunks: Blob[] = [];

const useRecordingStore = create<RecordingState>((set, get) => {
  const cleanup = () => {
    const { mediaRecorder, mediaStream } = get();

    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
    }
    if (recordTimeTimer) {
      clearInterval(recordTimeTimer);
      recordTimeTimer = null;
    }
    if (chunkTimer) {
      clearInterval(chunkTimer);
      chunkTimer = null;
    }
    audioChunks = [];

    set({
      stt: null,
      meetingId: null,
      recordingStatus: "idle",
      recordingTime: 0,
      mediaRecorder: null,
      mediaStream: null,
    });
    console.log("Recording resources cleaned up.");
  };

  return {
    stt: null,
    meetingId: null,
    recordingStatus: "idle",
    recordingTime: 0,
    mediaRecorder: null,
    mediaStream: null,

    isRecording: () => {
      const status = get().recordingStatus;
      return status === "recording" || status === "paused";
    },

    startRecording: async (meetingId, onNewStt) => {
      if (get().isRecording()) {
        console.warn("Recording already in progress.");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const newStt = await apiStartRecording(meetingId);
        onNewStt(newStt);

        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.push(event.data);
          }
        };

        recorder.onstop = () => {
          if (recordTimeTimer) clearInterval(recordTimeTimer);
          if (chunkTimer) clearInterval(chunkTimer);
          recordTimeTimer = null;
          chunkTimer = null;
          set({ recordingStatus: "encoding" });
        };

        recorder.start(1000);

        recordTimeTimer = window.setInterval(() => {
          set((state) => ({ recordingTime: state.recordingTime + 1 }));
        }, 1000);

        chunkTimer = window.setInterval(async () => {
          if (audioChunks.length > 0 && get().stt) {
            const chunk = new Blob(audioChunks, { type: "audio/wav" });
            audioChunks = [];
            const formData = new FormData();
            formData.append("file", chunk, "chunk.wav");
            try {
              await uploadAudioChunk(get().stt!.id, formData);
            } catch (e) {
              console.error("Chunk upload failed:", e);
              alert("네트워크가 불안정합니다. 확인 후 재시도바랍니다.");
              cleanup();
            }
          }
        }, 10000);

        set({
          stt: newStt,
          meetingId: meetingId,
          recordingStatus: "recording",
          recordingTime: 0,
          mediaRecorder: recorder,
          mediaStream: stream,
        });
      } catch (error) {
        alert(
          "마이크 권한이 없습니다. 권한 허용 후 다시 시도해주세요. \n(모바일의 경우 앱 설정에서 브라우저 마이크 권한 설정)"
        );
        cleanup();
      }
    },

    pauseRecording: () => {
      const { mediaRecorder } = get();
      if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.pause();
        if (recordTimeTimer) clearInterval(recordTimeTimer);
        if (chunkTimer) clearInterval(chunkTimer);
        recordTimeTimer = null;
        chunkTimer = null;
        set({ recordingStatus: "paused" });
      }
    },

    resumeRecording: async () => {
      const { mediaRecorder, stt } = get();
      if (mediaRecorder && mediaRecorder.state === "paused") {
        mediaRecorder.resume();

        recordTimeTimer = window.setInterval(() => {
          set((state) => ({ recordingTime: state.recordingTime + 1 }));
        }, 1000);

        chunkTimer = window.setInterval(async () => {
          if (audioChunks.length > 0 && stt) {
            const chunk = new Blob(audioChunks, { type: "audio/wav" });
            audioChunks = [];
            const formData = new FormData();
            formData.append("file", chunk, "chunk.wav");
            try {
              await uploadAudioChunk(stt.id, formData);
            } catch (e) {
              console.error("Chunk upload failed:", e);
              alert("네트워크가 불안정합니다. 확인 후 재시도바랍니다.");
              cleanup();
            }
          }
        }, 10000);
        set({ recordingStatus: "recording" });
      }
    },

    stopRecording: async () => {
      const { mediaRecorder, stt } = get();
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
        const remainingChunks = audioChunks;
        if (remainingChunks.length > 0 && stt) {
          const finalChunk = new Blob(remainingChunks, { type: "audio/wav" });
          audioChunks = [];
          const formData = new FormData();
          formData.append("file", finalChunk, "final.wav");
          formData.append("finish", String(true));
          try{
            await uploadAudioChunk(stt.id, formData);
            set({ recordingStatus: "finished" });
          } catch(e) {
            console.error("Final chunk upload failed:", e)
            alert("네트워크가 불안정합니다. 확인 후 재시도바랍니다.");
          } finally {
            cleanup();
          }
        }
      }
    },

    confirmUpload: async (sttId: number) => {
      try {
        const resStt = await finishRecording(sttId);
        cleanup();
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
      cleanup();
    },

    handleLastChunk: async () => {
      const { mediaRecorder, stt } = get();
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
        const remainingChunks = audioChunks;
        if (remainingChunks.length > 0 && stt) {
          const finalChunk = new Blob(remainingChunks, { type: "audio/wav" });
          audioChunks = [];
          const formData = new FormData();
          formData.append("file", finalChunk, "final.wav");
          formData.append("finish", String(true));
          uploadAudioChunk(stt.id, formData).then(() => {
            set({ recordingStatus: "finished" });
          }).catch((e) => {
            console.error("Final chunk upload failed:", e)
            alert("네트워크가 불안정합니다. 확인 후 재시도바랍니다.");
            cleanup();
          });
        }
      }
      cleanup();
    }
  };
});

export default useRecordingStore;
