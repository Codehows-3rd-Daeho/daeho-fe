import {
  createMeetingComment,
  getMeetingComments,
} from "../../comment/api/CommentApi";
import CommentSection from "../../comment/component/CommentSection";
import { useCommentController } from "../../comment/component/useCommentController";

export default function TabComment({ meetingId }: { meetingId: number }) {
  const {
    comments,
    commentText,
    hasMore,
    setCommentText,
    setMentionedMemberIds,
    loadComments,
    submit,
  } = useCommentController({
    targetId: meetingId,
    fetchApi: getMeetingComments,
    createApi: createMeetingComment,
  });

  return (
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
  );
}
