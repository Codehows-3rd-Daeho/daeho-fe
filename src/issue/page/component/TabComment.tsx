import {
  getIssueComments,
  createIssueComment,
} from "../../../comment/api/CommentApi";
import CommentSection from "../../../comment/component/CommentSection";
import { useCommentController } from "../../../comment/component/useCommentController";

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
