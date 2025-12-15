import httpClient from "../../config/httpClient";

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
export const getSTT = async (meetingId: string) => {
  await httpClient.get(`/stt/meeting/${meetingId}`);
};
