import httpClient from "../../config/httpClient";
import type {
  CommentDto,
  CommentsResponse,
  MentionMemberDto,
} from "../type/type";

/* ==================================================
   Issue
================================================== */

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
  formData: FormData
): Promise<CommentDto> => {
  const response = await httpClient.post(
    `/issue/${issueId}/comment`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
};

/* ==================================================
   Comment (공통: Issue / Meeting)
================================================== */

// ✅ 댓글 수정
export const updateComment = async (
  commentId: number,
  formData: FormData
): Promise<CommentDto> => {
  const response = await httpClient.put(`/comment/${commentId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// ✅ 댓글 삭제 (soft delete)
export const deleteComment = async (commentId: number): Promise<void> => {
  await httpClient.delete(`/comment/${commentId}`);
};

/* ==================================================
   Meeting
================================================== */

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
  formData: FormData
): Promise<CommentDto> => {
  const response = await httpClient.post(
    `/meeting/${meetingId}/comment`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
};

/* ==================================================
   Mention
================================================== */

export const searchMembersForMention = async (
  keyword: string
): Promise<MentionMemberDto[]> => {
  const response = await httpClient.get("/members/search", {
    params: { keyword },
  });
  return response.data;
};
