
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

// =====================================================================
// CommentItem Props 인터페이스
// =====================================================================

export interface CommentItemProps {
  comment: CommentDto;
  currentUserId: number; // ✨ 로그인된 사용자 ID를 prop으로 받음
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
  currentUserId, // ✨ prop 사용
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
            <Button size="small" onClick={handleCancelEdit}>
              취소
            </Button>
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
                setNewFiles((prev) => [
                  ...prev,
                  ...e.target.files!,
                ]);
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
            <Button
              size="small"
              variant="contained"
              onClick={handleUpdate}
              disabled={!editedContent.trim() && currentFiles.length + newFiles.length === 0}
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
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography fontWeight={600}>
            {comment.writerName} {comment.writerJPName}
          </Typography>
          {isMyComment && (
            <Box>
              <IconButton
                aria-label="more"
                id="long-button"
                aria-controls={open ? "long-menu" : undefined}
                aria-expanded={open ? "true" : undefined}
                aria-haspopup="true"
                onClick={handleClick}
              >
                ...
              </IconButton>
              <Menu
                id="long-menu"
                MenuListProps={{
                  "aria-labelledby": "long-button",
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                  style: {
                    maxHeight: 48 * 4.5,
                    width: "100px",
                  },
                }}
              >
                <MenuItem onClick={handleEditClick}>수정</MenuItem>
                <MenuItem onClick={handleDeleteClick}>삭제</MenuItem>
              </Menu>
            </Box>
          )}
        </Box>

        <Typography color="text.secondary" sx={{ whiteSpace: "pre-wrap" }}>
          {comment.content}
        </Typography>
        <Typography fontSize="0.8rem" color="text.disabled">
          {comment.createdAt?.slice(0, 16).replace("T", " ")}
        </Typography>

        {comment.fileList && comment.fileList.length > 0 && (
          <FileList
            files={comment.fileList.map((f) => ({
              fileId: f.fileId,
              originalName: f.originalName,
              path: f.path,
              size: f.size,
            }))}
          />
        )}
      </Box>
    </Box>
  );
};