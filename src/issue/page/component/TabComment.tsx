import {
  getIssueComments,
  createIssueComment,
} from "../../../comment/api/CommentApi";
import { useCommentController } from "../../../comment/component/useCommentController";
import { CommonPagination } from "../../../common/Pagination/Pagination";
import CommentSection from "../../../comment/component/CommentSection";
import { Box } from "@mui/material";

export default function TabComment({ issueId }: { issueId: number }) {
  const {
    comments,
    commentText,
    setCommentText,
    addMentionedMemberId,
    submit,
    page,
    totalCount,
    changePage,
  } = useCommentController({
    targetId: issueId,
    fetchApi: getIssueComments,
    createApi: createIssueComment,
  });

  return (
    <Box>
      {/* 1️⃣ 댓글 목록 */}
      <CommentSection comments={comments} enableInput={false} />

      {comments.length === 0 && (
        <Box sx={{ textAlign: "center", color: "text.disabled", my: 2 }}>
          아직 등록된 댓글이 없습니다.
        </Box>
      )}

      {/* 2️⃣ 페이지네이션 (목록 아래 / 입력창 위) */}
      <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
        <CommonPagination
          page={page}
          totalCount={totalCount}
          onPageChange={changePage}
        />
      </Box>

      {/* 3️⃣ 댓글 입력창 */}
      <CommentSection
        comments={[]}
        enableMention
        commentText={commentText}
        onChangeText={setCommentText}
        onAddMention={addMentionedMemberId}
        onSubmit={submit}
      />
    </Box>
  );
}
