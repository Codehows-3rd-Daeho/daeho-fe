import axios from "axios";
import type { MeetingListResponse } from "../type/type";
import { getAxiosAuthHeaders } from "../../admin/api/MemberApi";

import { BASE_URL } from "../../config/BaseUrl";

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
  await axios.post(`${BASE_URL}/issue/create`, formData, {
    headers: {
      ...getAxiosAuthHeaders().headers,
    },
  });
};
