import { useRef, useState } from "react";
import type { CommentDto } from "../type/type"; // 필요시 type 경로 수정
import {
  Avatar,
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
  Menu,
  MenuItem,
} from "@mui/material";
import FileList from "./FileList"; // FileList 경로 확인
import CloseIcon from "@mui/icons-material/Close";
import MoreVertIcon from "@mui/icons-material/MoreVert";

// =====================================================================
// CommentItem Props 인터페이스
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
    removeFileIds: number[]
  ) => Promise<void>;
  onDeleteComment?: (commentId: number) => Promise<void>;
}

// =====================================================================
// CommentItem 컴포넌트
// =====================================================================

export const CommentItem = ({
  comment,
  currentUserId,
  onUpdateComment,
  onDeleteComment,
}: CommentItemProps) => {
  // 로그인된 사용자와 댓글 작성자가 동일한지 확인
  const isMyComment = comment.writerMemberId === currentUserId;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [removeFileIds, setRemoveFileIds] = useState<number[]>([]);

  const newFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setAnchorEl(null);
    setEditedContent(comment.content);
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
    // 내용 또는 파일이 하나도 없으면 경고
    if (
      !editedContent.trim() &&
      newFiles.length === 0 &&
      removeFileIds.length === comment.fileList.length
    ) {
      alert("내용 또는 파일을 입력하세요.");
      return;
    }

    try {
      await onUpdateComment?.(
        comment.id,
        editedContent,
        newFiles,
        removeFileIds
      );
      setIsEditing(false);
    } catch (error) {
      console.error("댓글 수정 실패:", error);
      alert("댓글 수정에 실패했습니다.");
    }
  };

  const handleRemoveExistingFile = (fileId: number) => {
    setRemoveFileIds((prev) => [...prev, fileId]);
  };

  const handleRemoveNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(comment.content);
    setNewFiles([]);
    setRemoveFileIds([]);
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const createdTime = new Date(comment.createdAt).getTime();
  const updatedTime = new Date(comment.updatedAt).getTime();

  const isUpdated = updatedTime > createdTime;

  // === 수정 모드 렌더링 ===
  if (isEditing) {
    const currentFiles = comment.fileList.filter(
      (f) => !removeFileIds.includes(f.fileId)
    );

    return (
      <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
        <Avatar sx={{ width: 40, height: 40 }}>👤</Avatar>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography fontWeight={600}>
              {comment.writerName} {comment.writerJPName}
            </Typography>
          </Box>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            sx={{ mb: 1 }}
          />

          {currentFiles.length > 0 && (
            <FileList
              files={currentFiles}
              onRemoveFile={handleRemoveExistingFile}
            />
          )}

          {/* 신규 첨부파일 입력 */}
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
                setNewFiles((prev) => [...prev, ...e.target.files!]);
              }}
              onClick={(e) => (e.currentTarget.value = "")}
            />

            {/* 신규 첨부파일 목록 및 삭제 버튼 */}
            {newFiles.map((file, idx) => (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  py: 0.5,
                  fontSize: "0.85rem",
                  color: "text.secondary",
                }}
              >
                {file.name}
                <IconButton
                  size="small"
                  onClick={() => handleRemoveNewFile(idx)}
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
            <Button
              size="small"
              variant="contained"
              onClick={handleUpdate}
              disabled={
                !editedContent.trim() &&
                currentFiles.length + newFiles.length === 0
              }
            >
              수정 완료
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  // === 일반 보기 모드 렌더링 ===
  return (
    <Box key={comment.id} sx={{ mb: 3, display: "flex", gap: 2 }}>
      <Avatar sx={{ width: 40, height: 40 }}>👤</Avatar>

      <Box sx={{ flex: 1 }}>
        {/* 헤더 영역 */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            minHeight: 32, // ⭐ 메뉴 열려도 레이아웃 안 흔들림
          }}
        >
          <Typography fontWeight={600}>
            {comment.writerName} {comment.writerJPName}
          </Typography>

          {isMyComment && (
            <>
              <IconButton
                size="small"
                aria-label="more"
                aria-controls={open ? "long-menu" : undefined}
                aria-expanded={open ? "true" : undefined}
                aria-haspopup="true"
                onClick={handleClick}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>

              <Menu
                id="long-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                PaperProps={{
                  sx: {
                    width: 100,
                  },
                }}
              >
                <MenuItem onClick={handleEditClick}>수정</MenuItem>
                <MenuItem onClick={handleDeleteClick}>삭제</MenuItem>
              </Menu>
            </>
          )}
        </Box>

        {/* 댓글 내용 */}
        <Typography sx={{ mt: 1, whiteSpace: "pre-line" }}>
          {comment.content}
        </Typography>

        {/* ===== 첨부 파일 (일반 보기) ===== */}
        {comment.fileList && comment.fileList.length > 0 && (
          <FileList files={comment.fileList} />
        )}

        {/* ===== 등록/수정일 ===== */}
        <Typography
          sx={{
            mt: 0.5,
            fontSize: "0.75rem",
            color: "text.secondary",
            textAlign: "left",
          }}
        >
          {isUpdated
            ? `${formatDate(comment.updatedAt)} (수정됨)`
            : formatDate(comment.createdAt)}
        </Typography>
      </Box>
    </Box>
  );
};
