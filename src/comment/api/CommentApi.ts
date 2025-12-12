import httpClient from "../../config/httpClient";
import type { CommentDto } from "../type/type";

export interface CommentsResponse {
  content: CommentDto[];
  totalElements: number;
}

// 이슈 댓글 조회
export const getIssueComments = async (
  issueId: number,
  page: number,
  size: number = 10
): Promise<CommentsResponse> => {
  const response = await httpClient.get(`/issue/${issueId}/comments`, {
    params: { page, size },
  });

  return response.data;
};

// 이슈 댓글 생성
export const createIssueComment = async (
  issueId: number,
  content: string
): Promise<CommentDto> => {
  const payload = {
    targetId: issueId,
    targetType: "ISSUE",
    content,
  };

  const response = await httpClient.post(`/issue/${issueId}/comment`, payload);
  return response.data;
};

// 회의 댓글 조회
export const getMeetingComments = async (
  meetingId: number,
  page: number,
  size: number = 10
): Promise<CommentsResponse> => {
  const response = await httpClient.get(`/meeting/${meetingId}/comments`, {
    params: { page, size },
  });

  return response.data;
};

// 회의 댓글 생성
export const createMeetingComment = async (
  meetingId: number,
  content: string
): Promise<CommentDto> => {
  const payload = {
    targetId: meetingId,
    targetType: "MEETING",
    content,
  };

  const response = await httpClient.post(
    `/meeting/${meetingId}/comment`,
    payload
  );
  return response.data;
};
