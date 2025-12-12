import httpClient from "../../config/httpClient";
import type { CommentsResponse } from "../type/type";

// 댓글 조회
export const getComments = async (
  page: number,
  size: number = 10
): Promise<CommentsResponse> => {
  const response = await httpClient.get(`/issue/{id}/commnets`, {
    params: { page, size },
  });
  return response.data;
};

// 이슈 댓글 등록
export const CommentCreate = async (formData: FormData) => {
  await httpClient.post(`/issue/{id}/comment`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
