import { Box } from "@mui/material";
import {
  createMeetingComment,
  getMeetingComments,
  updateComment as updateCommentApi,
  deleteComment as deleteCommentApi,
} from "../../../comment/api/CommentApi";
import { useCommentController } from "../../../comment/component/useCommentController";
import { useAuthStore } from "../../../store/useAuthStore";
import CommentSection from "../../../comment/component/CommentSection";
import { CommonPagination } from "../../../common/Pagination/Pagination";
import { useEffect, useState } from "react";
import type { MentionMemberDto } from "../../../comment/type/type";
import { getPartMemberList } from "../../../admin/member/api/MemberApi";

interface Props {
  meetingId: number;
}

export default function TabComment({ meetingId }: Props) {
  /* =========================
     로그인 사용자
  ========================= */
  const { member } = useAuthStore(); // member.id

  /* =========================
     댓글 컨트롤러
  ========================= */
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
    targetId: meetingId,
    fetchApi: getMeetingComments,
    createApi: createMeetingComment,
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
      {/* ================= 댓글 목록 ================= */}
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

      {/* ================= 페이지네이션 ================= */}
      <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
        <CommonPagination
          page={page}
          totalCount={totalCount}
          onPageChange={changePage}
        />
      </Box>

      {/* ================= 댓글 입력 ================= */}
      <CommentSection
        comments={[]}
        enableMention
        commentText={commentText}
        memberList={memberList}
        onChangeText={setCommentText}
        onAddMention={addMentionedMemberId}
        onSubmit={submit}
      />
    </Box>
  );
}
