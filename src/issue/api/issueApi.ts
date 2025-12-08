import type { IssueFormValues, IssueListResponse } from "../type/type";
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
//이슈 리스트
export const getIssue = async (): Promise<IssueFormValues[]> => {
  const response = await httpClient.get(`/issue/list`);
  console.log("이슈들 :", response.data);
  return response.data;
};
