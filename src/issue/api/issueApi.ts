import type { IssueIdTitle, IssueListResponse } from "../type/type";
import httpClient from "../../config/httpClient";
import type { IssueInMeeting } from "../../meeting/type/type";

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
export const getIssueInMeeting = async (): Promise<IssueIdTitle[]> => {
  const response = await httpClient.get(`/issue/list`);
  return response.data;
};

//선택한 이슈 조회(회의 등록시 자동으로 카테고리, 부서, 참여자 선택하려고)
export const getSelectedINM = async (
  idNumber: number
): Promise<IssueInMeeting> => {
  const response = await httpClient.get(`/issue/list/${idNumber}`);
  return response.data;
};
