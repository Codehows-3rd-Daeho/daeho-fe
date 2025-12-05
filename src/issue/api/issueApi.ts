import type { IssueListResponse } from "../type/type";
import httpClient from "../../config/httpClient";

// 이슈 목록 조회
export const getIssueList = async (
  page: number,
  size: number = 10
): Promise<IssueListResponse> => {
  const response = await httpClient.get(`/issue`, {
    params: { page, size },
  });
  return response.data;
};

//등록
export const issueCreate = async (formData: FormData) => {
  await httpClient.post(`/issue/create`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
