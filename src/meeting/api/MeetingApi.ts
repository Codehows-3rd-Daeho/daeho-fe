import axios from "axios";
import type { MeetingListResponse } from "../type/type";
import httpClient from "../../config/httpClient";

// 회의 목록 조회
export const getMeetingList = async (
  page: number,
  size: number = 10
): Promise<MeetingListResponse> => {
  const response = await axios.get(`/api/meeting`, {
    params: { page, size },
  });
  return response.data; // { content, totalElements }
};

//등록
export const meetingCreate = async (formData: FormData) => {
  await httpClient.post(`/issue/create`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
