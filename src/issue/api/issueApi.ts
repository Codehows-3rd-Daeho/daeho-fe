import type {
  IssueDtlDto,
  IssueIdTitle,
  IssueListItem,
  IssueListResponse,
} from "../type/type";
import httpClient from "../../config/httpClient";
import type { IssueInMeeting } from "../../meeting/type/type";

// 이슈 목록 조회
export const getIssueList = async (
  page: number,
  size: number = 10
): Promise<IssueListResponse> => {
  const response = await httpClient.get(`/issue/list`, {
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
  const response = await httpClient.get(`/issue/list/v2`);
  return response.data;
};

//선택한 이슈 조회(회의 등록시 자동으로 카테고리, 부서, 참여자 선택하려고)
export const getSelectedINM = async (
  idNumber: number
): Promise<IssueInMeeting> => {
  const response = await httpClient.get(`/issue/list/${idNumber}`);
  return response.data;
};

type temp = {
  inProgress: IssueListItem[];
  completed: IssueListItem[];
  delayed: IssueListItem[];
};

export const getKanbanIssues = async (): Promise<temp> => {
  const response = await httpClient.get("/issue/kanban");
  return response.data;
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
