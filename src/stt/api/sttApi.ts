import httpClient from "../../config/httpClient";
import type { STT } from "../type/type";

//stt 등록
export const uploadSTT = async (id: string, formData: FormData): Promise<STT> => {
  const response = await httpClient.post(`/stt/meeting/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

//stt 반환 결과 조회
export const getSTT = async (id: string): Promise<STT[]> => {
  const response = await httpClient.get(`/stt/meeting/${id}`);
  return response.data;
};

// stt 삭제
export const deleteSTT = async (id: number): Promise<void> => {
  const response = await httpClient.delete(`/stt/${id}`);
  return response.data;
};

export const updateSummary = async (id: number, content: string): Promise<void> => {
  await httpClient.patch(`/stt/${id}/summary`, content, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
};

export const startRecording = async (meetingId: string): Promise<STT> => {
  const response = await httpClient.post(`/stt/recording/start`, { meetingId });
  return response.data;
};

export const uploadAudioChunk = async (sttId: number, chunk: FormData): Promise<STT> => {
  const response = await httpClient.post(`/stt/${sttId}/chunk`, chunk, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const finishRecording = async (sttId: number): Promise<STT> => {
  const response = await httpClient.post(`/stt/${sttId}/recording/finish`);
  return response.data;
};