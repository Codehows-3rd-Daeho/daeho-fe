import type {
  IssueDto,
  IssueIdTitle,
  IssueListItem,
  IssueListResponse,
} from "../type/type";
import httpClient from "../../config/httpClient";
import type {
  IssueInMeeting,
  MeetingListResponse,
} from "../../meeting/type/type";

// 이슈 목록 조회
export const getIssueList = async (
  page: number,
  size: number = 10,
  keyword: string
): Promise<IssueListResponse> => {
  const response = await httpClient.get(`/issue/list`, {
    params: { page, size, keyword },
  });
  return response.data;
};

//나의 업무 - 리스트
export const getIssueListMT = async (
  id: number,
  page: number,
  size: number = 10
): Promise<IssueListResponse> => {
  console.log("getIssueListMT id: ", id);
  const response = await httpClient.get(`/issue/list/mytask/${id}`, {
    params: { page, size },
  });
  console.log("response.data: ", response.data);
  return response.data;
};

//등록
export const issueCreate = async (formData: FormData) => {
  const response = await httpClient.post(`/issue/create`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

//이슈 리스트
export const getIssueInMeeting = async (): Promise<IssueIdTitle[]> => {
  const response = await httpClient.get(`/issue/related`);
  return response.data;
};

//선택한 이슈 조회(회의 등록시 자동으로 카테고리, 부서, 참여자 선택하려고)
export const getSelectedINM = async (
  idNumber: number
): Promise<IssueInMeeting> => {
  const response = await httpClient.get(`/issue/related/${idNumber}`);
  return response.data;
};

type temp = {
  inProgress: IssueListItem[];
  completed: IssueListItem[];
  delayed: IssueListItem[];
};

//칸반 전체
export const getKanbanIssues = async (keyword: string): Promise<temp> => {
  const response = await httpClient.get(`/issue/kanban`, {
    params: { keyword },
  });
  return response.data;
};

//나의 업무 칸반
export const getKanbanIssuesMT = async (id: number): Promise<temp> => {
  const response = await httpClient.get(`/issue/kanban/mytask/${id}`);
  return response.data;
};

// 상세 조회
export const getIssueDtl = async (issueId: string): Promise<IssueDto> => {
  const response = await httpClient.get(`/issue/${issueId}`);
  console.log(response);
  return response.data;
};

// 상세 조회 - 참여자의 이슈 확인 상태 업데이트
export const updateReadStatus = async (issueId: string): Promise<void> => {
  await httpClient.put(`/issue/${issueId}/readStatus`);
  console.log(`API: 이슈 ${issueId}의 읽음 상태를 '확인'으로 업데이트`);
};

// 상세 조회 - 해당 이슈의 관련 회의 list받아오기
export const getMeetingRelatedIssue = async (
  issueId: string,
  page: number,
  size: number = 5
): Promise<MeetingListResponse> => {
  const response = await httpClient.get(`/issue/${issueId}/meeting`, {
    params: { page, size },
  });
  console.log(response);
  return response.data;
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
