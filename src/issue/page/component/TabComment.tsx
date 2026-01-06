import {
  getIssueComments,
  createIssueComment,
  updateComment as updateCommentApi,
  deleteComment as deleteCommentApi,
} from "../../../comment/api/CommentApi";
import { useCommentController } from "../../../comment/component/useCommentController";
import { CommonPagination } from "../../../common/Pagination/Pagination";
import CommentSection from "../../../comment/component/CommentSection";
import { Box } from "@mui/material";
import { useAuthStore } from "../../../store/useAuthStore";
import { useEffect, useState } from "react";
import type { MentionMemberDto } from "../../../comment/type/type";
import { getPartMemberList } from "../../../admin/member/api/MemberApi";

interface Props {
  issueId: number;
}

export default function TabComment({ issueId }: Props) {
  const { member } = useAuthStore();
  const {
    comments,
    commentText,
    setCommentText,
    addMentionedMemberId,
    submit,
    page,
    totalCount,
    changePage,
    updateComment,
    deleteComment,
  } = useCommentController({
    targetId: issueId,
    fetchApi: getIssueComments,
    createApi: createIssueComment,
    updateApi: updateCommentApi,
    deleteApi: deleteCommentApi,
  });
  const [memberList, setMemberList] = useState<MentionMemberDto[]>([]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = await getPartMemberList();
        setMemberList(data as unknown as MentionMemberDto[]);
      } catch (error) {
        console.error("멘션 멤버 목록 로드 실패:", error);
      }
    };
    fetchMembers();
  }, []);

  return (
    <Box>
      {/* 1. 댓글 목록 섹션 (입력창 비활성화) */}
      <CommentSection
        comments={comments}
        enableInput={false}
        currentMemberId={member?.memberId}
        onUpdateComment={updateComment}
        onDeleteComment={deleteComment}
      />

      {comments.length === 0 && (
        <Box sx={{ textAlign: "center", color: "text.disabled", my: 2 }}>
          아직 등록된 댓글이 없습니다.
        </Box>
      )}

      {/* 2. 페이지네이션 */}
      <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
        <CommonPagination
          page={page}
          totalCount={totalCount}
          onPageChange={changePage}
        />
      </Box>

      {/* 3. 댓글 입력 섹션 (여기에 placeholder 추가) */}
      <CommentSection
        comments={[]}
        enableInput={true}
        enableMention
        memberList={memberList}
        commentText={commentText}
        onChangeText={setCommentText}
        onAddMention={addMentionedMemberId}
        onSubmit={submit}
      />
    </Box>
  );
}
