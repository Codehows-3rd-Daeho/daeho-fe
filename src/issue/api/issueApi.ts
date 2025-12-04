import axios from "axios";
import { getAxiosAuthHeaders } from "../../admin/api/MemberApi";
import { BASE_URL } from "../../config/BaseUrl";
import type { IssueListResponse } from "../type/type";

// 이슈 목록 조회
export const getIssueList = async (
  page: number,
  size: number = 10
): Promise<IssueListResponse> => {
  const response = await axios.get(`/api/issue`, {
    params: { page, size },
  });
  return response.data; // { content, totalElements }
};

//등록
export const issueCreate = async (formData: FormData) => {
  //헤더 로그 확인용
  console.log("헤더:", {
    headers: {
      ...getAxiosAuthHeaders().headers,
    },
  });

  await axios.post(`${BASE_URL}/issue/create`, formData, {
    headers: {
      ...getAxiosAuthHeaders().headers,
    },
  });
};

// 이슈 목록 조회
export const getIssueList = async (
  page: number,
  size: number = 10
): Promise<IssueListResponse> => {
  const response = await axios.get(`${BASE_URL}/issue`, {
    params: { page, size },
  });
  return response.data; // { content, totalElements }
};
