import type { IssueDtlDto, IssueListResponse } from "../type/type";
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

// 상세 조회
export const getIssueDtl = async (issueId: string): Promise<IssueDtlDto> => {
  const response = await httpClient.get(`/issue/${issueId}`);
  console.log(response);
  return response.data;
};

// 상세 조회 - 참여자의 이슈 확인 상태 업데이트
export const updateReadStatus = async (issueId: string): Promise<void> => {
  await httpClient.put(`/issue/${issueId}/readStatus`);
  console.log(`API: 이슈 ${issueId}의 읽음 상태를 '확인'으로 업데이트`);
};

// 수정
export const updateIssue = async (issueId: string, formData: FormData) => {
  const response = await httpClient.put(`/issue/${issueId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// 삭제
export const deleteIssue = async (issueId: string): Promise<void> => {
  const response = await httpClient.delete(`/issue/${issueId}`);
  return response.data;
};
