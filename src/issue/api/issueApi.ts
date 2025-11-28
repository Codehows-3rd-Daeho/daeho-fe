import axios from "axios";
import type { IssueListResponse } from "../type/type";

export const BASE_URL = import.meta.env.VITE_API_URL;

//등록
export const issueRegister = async (formData: FormData) => {
  await axios.post(`${BASE_URL}/issue/register`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
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
