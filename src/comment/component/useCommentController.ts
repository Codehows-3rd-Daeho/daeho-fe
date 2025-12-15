// common/comment/useCommentController.ts
import { useState, useEffect } from "react";
import type { CommentDto, CommentsResponse } from "../type/type";

interface Props {
  targetId: number;
  fetchApi: (id: number, page: number) => Promise<CommentsResponse>;
  createApi: (
    id: number,
    payload: {
      content: string;
      mentionedMemberIds: number[];
    }
  ) => Promise<CommentDto>;
}
export function useCommentController({ targetId, fetchApi, createApi }: Props) {
  const [comments, setComments] = useState<CommentDto[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const size = 10;

  // 댓글 조회
  const loadComments = async (pageNumber: number) => {
    const data = await fetchApi(targetId, pageNumber - 1, size);

    setComments(data.content);
    setTotalCount(data.totalElements);
  };

  // 댓글 작성
  const submit = async (payload: {
    content: string;
    mentionedMemberIds: number[];
  }) => {
    const newComment = await createApi(targetId, payload);

    const newTotal = totalCount + 1;
    const lastPage = Math.ceil(newTotal / size);

    setPage(lastPage);

    setTimeout(() => loadComments(lastPage), 0);
  };

  // 초기 로드
  useEffect(() => {
    loadComments(page);
  }, [page, targetId]);

  return {
    comments,
    page,
    totalCount,
    setPage,
    submit,
  };
}
