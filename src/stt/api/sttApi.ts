import httpClient from "../../config/httpClient";
import type { STT } from "../type/type";

//stt 등록
export const uploadSTT = async (id: string, formData: FormData) => {
  console.log("id: ", id);
  await httpClient.post(`/stt/meeting/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

//stt 반환 결과 조회
export const getSTT = async (id: string): Promise<STT[]> => {
  const response = await httpClient.get(`/stt/meeting/${id}`);
  return response.data;
};

//summary 요청
export const uploadContext = async (id: number, content: string) => {
  console.log("id: ", id);
  await httpClient.post(`/stt/${id}/summary`, content);
};

// stt 삭제
export const deleteSTT = async (id: number): Promise<void> => {
  const response = await httpClient.delete(`/stt/${id}`);
  return response.data;
};
