import axios from "axios";
import type { MeetingListResponse } from "../type/type";

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
