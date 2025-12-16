import httpClient from "../../config/httpClient";
import type {
  CommentDto,
  CommentsResponse,
  MentionMemberDto,
} from "../type/type";

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
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
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
  formData: FormData
): Promise<CommentDto> => {
  const response = await httpClient.post(
    `/meeting/${meetingId}/comment`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export const searchMembersForMention = async (
  keyword: string
): Promise<MentionMemberDto[]> => {
  const response = await httpClient.get("/members/search", {
    params: { keyword },
  });

  return response.data;
};
