import { useRef, useState } from "react";
import type { CommentDto, Mention } from "../type/type";
import {
  Avatar,
  Box,
  Button,
  IconButton,
  Typography,
  Menu,
  MenuItem,
} from "@mui/material";
import FileList from "./FileList";
import CloseIcon from "@mui/icons-material/Close";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RenderMentionText from "./mention/RenderMentionText";
import MentionTextInput from "./mention/MentionTextInput";

// =====================================================================
// CommentItem Props
// =====================================================================

export interface CommentItemProps {
  comment: CommentDto;
  currentUserId: number;
  maxFileSize: number | null;
  allowedExtensions: string[] | null;
  onUpdateComment?: (
    commentId: number,
    content: string,
    newFiles: File[],
    removeFileIds: number[],
    mentionedMemberIds?: number[]
  ) => Promise<void>;
  onDeleteComment?: (commentId: number) => Promise<void>;
}

// =====================================================================
// CommentItem Component
// =====================================================================

export const CommentItem = ({
  comment,
  currentUserId,
  onUpdateComment,
  onDeleteComment,
}: CommentItemProps) => {
  const isMyComment = comment.writerMemberId === currentUserId;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);

  // ⭐ 수정용 멘션 상태
  const [editMentions, setEditMentions] = useState<Mention[]>(
    comment.mentions ?? []
  );

  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [removeFileIds, setRemoveFileIds] = useState<number[]>([]);

  const newFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleEditClick = () => {
    setIsEditing(true);
    setAnchorEl(null);
    setEditedContent(comment.content);
    setEditMentions(comment.mentions ?? []);
    setNewFiles([]);
    setRemoveFileIds([]);
  };

  const handleDeleteClick = async () => {
    if (window.confirm("댓글을 삭제하시겠습니까?")) {
      await onDeleteComment?.(comment.id);
    }
    setAnchorEl(null);
  };

  const handleUpdate = async () => {
    const mentionedMemberIds = editMentions.map((m) => m.memberId);

    if (
      !editedContent.trim() &&
      newFiles.length === 0 &&
      removeFileIds.length === comment.fileList.length
    ) {
      alert("내용 또는 파일을 입력하세요.");
      return;
    }

    await onUpdateComment?.(
      comment.id,
      editedContent,
      newFiles,
      removeFileIds,
      mentionedMemberIds
    );

    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(comment.content);
    setEditMentions(comment.mentions ?? []);
    setNewFiles([]);
    setRemoveFileIds([]);
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  const isUpdated =
    new Date(comment.updatedAt).getTime() >
    new Date(comment.createdAt).getTime();

  // =====================================================================
  // ✏️ 수정 모드
  // =====================================================================
  if (isEditing) {
    const currentFiles = comment.fileList.filter(
      (f) => !removeFileIds.includes(f.fileId)
    );

    return (
      <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
        <Avatar sx={{ width: 40, height: 40 }}>👤</Avatar>

        <Box sx={{ flex: 1 }}>
          <Typography fontWeight={600}>
            {comment.writerName} {comment.writerJPName}
          </Typography>

          {/* ⭐ 멘션 입력 */}

          <MentionTextInput
            value={editedContent}
            onChange={setEditedContent}
            mentions={editMentions}
            setMentions={setEditMentions}
            enableMention={true}
            placeholder="댓글을 수정하세요"
            rows={3}
          />

          {currentFiles.length > 0 && (
            <FileList
              files={currentFiles}
              onRemoveFile={(id) => setRemoveFileIds((prev) => [...prev, id])}
            />
          )}

          {/* 신규 파일 */}
          <Box sx={{ mt: 1 }}>
            <Button
              size="small"
              onClick={() => newFileInputRef.current?.click()}
            >
              파일 추가
            </Button>

            <input
              type="file"
              multiple
              hidden
              ref={newFileInputRef}
              onChange={(e) => {
                if (!e.target.files) return;
                setNewFiles((prev) => [
                  ...prev,
                  ...Array.from(e.target.files!),
                ]);
              }}
            />

            {newFiles.map((file, idx) => (
              <Box key={idx} sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                {file.name}
                <IconButton
                  size="small"
                  onClick={() =>
                    setNewFiles((prev) => prev.filter((_, i) => i !== idx))
                  }
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
            <Button size="small" onClick={handleCancelEdit}>
              취소
            </Button>
            <Button size="small" variant="contained" onClick={handleUpdate}>
              수정 완료
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  // =====================================================================
  // 📄 일반 보기 모드
  // =====================================================================
  return (
    <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
      <Avatar sx={{ width: 40, height: 40 }}>👤</Avatar>

      <Box sx={{ flex: 1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography fontWeight={600}>
            {comment.writerName} {comment.writerJPName}
          </Typography>

          {isMyComment && (
            <>
              <IconButton
                size="small"
                onClick={(e) => setAnchorEl(e.currentTarget)}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={() => setAnchorEl(null)}
              >
                <MenuItem onClick={handleEditClick}>수정</MenuItem>
                <MenuItem onClick={handleDeleteClick}>삭제</MenuItem>
              </Menu>
            </>
          )}
        </Box>

        {/* 댓글 내용 */}
        <Typography sx={{ mt: 1, whiteSpace: "pre-line" }}>
          {RenderMentionText(comment.content, comment.mentions ?? [])}
        </Typography>

        {comment.fileList.length > 0 && <FileList files={comment.fileList} />}

        <Typography
          sx={{ mt: 0.5, fontSize: "0.75rem", color: "text.secondary" }}
        >
          {isUpdated
            ? `${formatDate(comment.updatedAt)} (수정됨)`
            : formatDate(comment.createdAt)}
        </Typography>
      </Box>
    </Box>
  );
};
