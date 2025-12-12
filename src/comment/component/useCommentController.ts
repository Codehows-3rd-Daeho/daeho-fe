// common/comment/useCommentController.ts
import { useState, useEffect } from "react";
import type { CommentDto, CommentsResponse } from "../type/type";

interface Props {
  targetId: number;
  fetchApi: (id: number, page: number) => Promise<CommentsResponse>;
  createApi: (id: number, content: string) => Promise<CommentDto>;
}

export function useCommentController({ targetId, fetchApi, createApi }: Props) {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<CommentDto[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // 댓글 조회
  const loadComments = async (reset = false) => {
    const data = await fetchApi(targetId, reset ? 0 : page);

    if (reset) setComments(data.content);
    else setComments((prev) => [...prev, ...data.content]);

    setHasMore(!data.last);
    setPage(data.number + 1);
  };

  // 댓글 작성
  const submit = async () => {
    if (!commentText.trim()) return;
    const newC = await createApi(targetId, commentText);
    setComments((prev) => [newC, ...prev]);
    setCommentText("");
  };

  // 초기 로드
  useEffect(() => {
    (async () => {
      await loadComments(true);
    })();
  }, [targetId]);

  return {
    comments,
    commentText,
    hasMore,
    setCommentText,
    loadComments,
    submit,
  };
}
