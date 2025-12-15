import { useEffect, useState } from "react";
import {
  getIssueComments,
  createIssueComment,
} from "../../../comment/api/CommentApi";
import CommentSection from "../../../comment/component/CommentSection";
import { useCommentController } from "../../../comment/component/useCommentController";
import { CommonPagination } from "../../../common/Pagination/Pagination";
import type { CommentDto } from "../../../comment/type/type";

export default function TabComment({ issueId }: { issueId: number }) {
  const {
    comments,
    commentText,
    hasMore,
    setCommentText,
    setMentionedMemberIds,
    loadComments,
    submit,
  } = useCommentController({
    targetId: issueId,
    fetchApi: getIssueComments,
    createApi: createIssueComment,
  });
  const [page, setPage] = useState(1);
  const [data, setData] = useState<CommentDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    getIssueComments(page - 1, 10).then((data) => {
      const list = (data.content ?? data).map((item: CommentDto) => ({
        ...item,
      }));

      setData(list);
      setTotalCount(data.totalElements); // 전체 개수
    });
  }, [page]);
  return (
    <>
      <CommentSection
        comments={comments}
        commentText={commentText}
        hasMore={hasMore}
        onChangeText={setCommentText}
        onLoadMore={() => loadComments(false)}
        onSubmit={submit}
        onAddMention={(id) =>
          setMentionedMemberIds((prev) =>
            prev.includes(id) ? prev : [...prev, id]
          )
        }
      />
      <CommonPagination
        page={page}
        totalCount={totalCount}
        onPageChange={setPage}
      />
    </>
  );
}
