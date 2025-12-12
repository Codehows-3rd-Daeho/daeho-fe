import httpClient from "../../config/httpClient";

//stt
export const uploadSTT = async (meetingId: string, formData: FormData) => {
  await httpClient.post(`/stt/meeting/${meetingId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

//stt 반환 결과 조회
export const getSTT = async (meetingId: string) => {
  await httpClient.get(`/stt/meeting/${meetingId}`);
};
