import { useEffect, useState } from "react";
import type { CommentDto, CommentsResponse } from "../type/type";

interface Props {
  targetId: number;
  fetchApi: (
    id: number,
    page: number,
    size: number
  ) => Promise<CommentsResponse>;
  createApi: (id: number, formData: FormData) => Promise<CommentDto>;
}

export function useCommentController({ targetId, fetchApi, createApi }: Props) {
  const [comments, setComments] = useState<CommentDto[]>([]);
  const [commentText, setCommentText] = useState("");
  const [mentionedMemberIds, setMentionedMemberIds] = useState<number[]>([]);

  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const size = 10;

  /* =========================
     초기 로딩 (마지막 페이지)
  ========================= */
  useEffect(() => {
    const init = async () => {
      const first = await fetchApi(targetId, 0, size);
      const total = first.totalElements;
      const lastPage = Math.max(1, Math.ceil(total / size));

      const last = await fetchApi(targetId, lastPage - 1, size);

      setComments(last.content);
      setTotalCount(total);
      setPage(lastPage);
    };

    init();
  }, [targetId]);

  /* =========================
     멘션 추가
  ========================= */
  const addMentionedMemberId = (memberId: number) => {
    setMentionedMemberIds((prev) =>
      prev.includes(memberId) ? prev : [...prev, memberId]
    );
  };

  /* =========================
     댓글 작성
  ========================= */
  const submit = async (files: File[]) => {
    if (!commentText.trim()) return;

    const formData = new FormData();

    formData.append(
      "data",
      new Blob([JSON.stringify({ content: commentText, mentionedMemberIds })], {
        type: "application/json",
      })
    );
    files.forEach((f) => formData.append("file", f));
    await createApi(targetId, formData);

    setCommentText("");
    setMentionedMemberIds([]);

    const newTotal = totalCount + 1;
    const lastPage = Math.ceil(newTotal / size);

    const data = await fetchApi(targetId, lastPage - 1, size);

    setComments(data.content);
    setTotalCount(data.totalElements);
    setPage(lastPage);
  };

  /* =========================
     페이지 변경
  ========================= */
  const changePage = async (nextPage: number) => {
    const data = await fetchApi(targetId, nextPage - 1, size);
    setComments(data.content);
    setTotalCount(data.totalElements);
    setPage(nextPage);
  };

  return {
    comments,
    commentText,
    page,
    totalCount,
    setCommentText,
    changePage,
    addMentionedMemberId,
    submit,
  };
}
