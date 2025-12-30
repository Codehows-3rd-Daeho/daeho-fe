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
  updateApi?: (commentId: number, formData: FormData) => Promise<CommentDto>;
  deleteApi?: (commentId: number) => Promise<void>;
}

export function useCommentController({
  targetId,
  fetchApi,
  createApi,
  updateApi,
  deleteApi,
}: Props) {
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
    if (!commentText.trim() && files.length === 0) return;

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

  /* =========================
     댓글 수정
  ========================= */
  const updateComment = async (
    commentId: number,
    content: string,
    newFiles: File[],
    removeFileIds: number[],
    mentionedMemberIds?: number[]
  ) => {
    if (!updateApi) return;

    const formData = new FormData();
    formData.append(
      "data",
      new Blob(
        [
          JSON.stringify({
            content,
            removeFileIds,
            mentionedMemberIds,
          }),
        ],
        {
          type: "application/json",
        }
      )
    );
    newFiles.forEach((f) => formData.append("file", f));

    await updateApi(commentId, formData);

    // 수정 후 새로 불러오기
    const data = await fetchApi(targetId, page - 1, size);
    setComments(data.content);
    setTotalCount(data.totalElements);
  };

  /* =========================
     댓글 삭제
  ========================= */
  const deleteComment = async (commentId: number) => {
    if (!deleteApi) return;

    await deleteApi(commentId);

    const newTotal = totalCount - 1;
    const lastPage = Math.max(1, Math.ceil(newTotal / size));
    const data = await fetchApi(targetId, lastPage - 1, size);

    setComments(data.content);
    setTotalCount(data.totalElements);
    setPage(lastPage);
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
    updateComment,
    deleteComment,
  };
}
