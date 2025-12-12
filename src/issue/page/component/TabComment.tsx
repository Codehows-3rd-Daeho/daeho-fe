import {
  Box,
  Avatar,
  Typography,
  TextField,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Input,
  Tooltip,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close"; // 파일 삭제 아이콘

import { useState, type ChangeEvent, type MouseEvent } from "react";

// 타입 정의 (이전과 동일)
interface Attachment {
  id: number; // 파일 삭제를 위한 고유 ID 추가
  name: string;
  size: number;
  objectURL?: string; // 다운로드를 위한 URL (클라이언트 파일만 해당)
}

interface Comment {
  id: number;
  author: string;
  content: string;
  timestamp: string;
  avatar: string;
  files?: Attachment[];
}

// 파일 크기를 MB 단위로 포맷팅하는 유틸리티 함수
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = 2;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

// ------------------- 파일 다운로드 기능 (더미) -------------------
const handleFileDownload = (file: Attachment) => {
  // 실제 환경에서는 file.id를 이용하여 서버에 다운로드 요청을 보냅니다.
  console.log(`파일 다운로드 요청: ${file.name} (ID: ${file.id})`);

  // 클라이언트 측에서 첨부한 파일 (objectURL이 있는 경우) 즉시 다운로드 (테스트용)
  if (file.objectURL) {
    const link = document.createElement("a");
    link.href = file.objectURL;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    // 서버 파일 다운로드 로직 (예시)
    alert(`"${file.name}" 다운로드 시작 (실제 환경에서는 서버 경로 필요)`);
  }
};
// -------------------------------------------------------------

export default function TabComment() {
  const [commentText, setCommentText] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<Attachment[]>([]); // Attachment 타입으로 변경
  const [comments, setComments] = useState<Comment[]>([]);

  // 수정 기능 관련 상태
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState("");

  // Menu 드롭다운 상태
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const [currentCommentId, setCurrentCommentId] = useState<number | null>(null);

  // 2. 이벤트 핸들러
  const handleMenuClick = (event: MouseEvent<HTMLElement>, id: number) => {
    setAnchorEl(event.currentTarget);
    setCurrentCommentId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentCommentId(null);
  };

  // 3. 파일 첨부 핸들러
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles: Attachment[] = Array.from(e.target.files).map((file) => ({
        id: Date.now() + Math.random(), // 임시 고유 ID
        name: file.name,
        size: file.size,
        objectURL: URL.createObjectURL(file), // 다운로드 테스트용 URL 생성
      }));
      setAttachedFiles([...attachedFiles, ...newFiles]);
    }
    // 파일 입력 후 초기화 (같은 파일을 다시 선택 가능하게 하기 위함)
    e.target.value = "";
  };

  // 4. 첨부 파일 삭제 핸들러 (입력 폼 내)
  const handleFileRemove = (fileId: number) => {
    const fileToRemove = attachedFiles.find((f) => f.id === fileId);
    if (fileToRemove?.objectURL) {
      URL.revokeObjectURL(fileToRemove.objectURL); // 임시 URL 해제
    }
    setAttachedFiles(attachedFiles.filter((file) => file.id !== fileId));
  };

  // 5. 댓글 추가/저장 (새 댓글)
  const handleAddComment = () => {
    if (!commentText.trim() && attachedFiles.length === 0) return;

    const newComment: Comment = {
      id: Date.now(),
      author: "새 사용자",
      content: commentText,
      timestamp: new Date()
        .toLocaleString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
        .replace(/\. /g, "."),
      avatar: "👤",
      files: attachedFiles, // Attachment 객체 통째로 저장
    };

    setComments([newComment, ...comments]);
    handleCancel();
  };

  // 6. 수정 모드 시작 (생략)
  const handleEditStart = (comment: Comment) => {
    setEditingId(comment.id);
    setEditedContent(comment.content);
    handleMenuClose();
  };

  // 7. 수정 내용 저장 (생략)
  const handleEditSave = () => {
    if (!editedContent.trim()) return;

    setComments(
      comments.map((c) =>
        c.id === editingId ? { ...c, content: editedContent } : c
      )
    );
    setEditingId(null);
    setEditedContent("");
  };

  // 8. 댓글 삭제 (생략)
  const handleDelete = (id: number) => {
    setComments(comments.filter((c) => c.id !== id));
    handleMenuClose();
  };

  // 9. 취소/초기화
  const handleCancel = () => {
    setCommentText("");
    // 첨부된 모든 임시 URL 해제
    attachedFiles.forEach((file) => {
      if (file.objectURL) {
        URL.revokeObjectURL(file.objectURL);
      }
    });
    setAttachedFiles([]);
    setEditingId(null);
    setEditedContent("");
  };

  // 10. 렌더링
  return (
    <Box>
      {/* 댓글 목록 */}
      {comments.length === 0 ? (
        <Box
          sx={{
            py: 5,
            textAlign: "center",
            color: "text.disabled",
            borderBottom: "1px solid #eee",
          }}
        >
          <Typography variant="h6">댓글이 없습니다.</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            새로운 의견을 작성해 보세요.
          </Typography>
        </Box>
      ) : (
        comments.map((comment) => (
          <Box
            key={comment.id}
            sx={{
              mb: 3,
              display: "flex",
              gap: 2,
              borderBottom: "1px solid #eee",
              pb: 3,
            }}
          >
            <Avatar sx={{ width: 40, height: 40, bgcolor: "#e0e0e0" }}>
              {comment.avatar}
            </Avatar>

            <Box sx={{ flex: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Typography sx={{ fontWeight: 600 }}>
                  {comment.author}
                </Typography>

                <IconButton
                  size="small"
                  onClick={(e) => handleMenuClick(e, comment.id)}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>

              {editingId === comment.id ? (
                <Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    sx={{ mb: 1 }}
                  />
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleCancel}
                    >
                      취소
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleEditSave}
                    >
                      저장
                    </Button>
                  </Stack>
                </Box>
              ) : (
                <Box>
                  <Typography
                    sx={{
                      color: "text.secondary",
                      mb: 1,
                      lineHeight: 1.6,
                    }}
                  >
                    {comment.content}
                  </Typography>
                </Box>
              )}

              {/* 첨부 파일 목록 (다운로드 기능 추가) */}
              {comment.files && comment.files.length > 0 && (
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {comment.files.map((file) => (
                    <Tooltip key={file.id} title="클릭하여 다운로드">
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{
                          bgcolor: "#f5f5f5",
                          p: 1,
                          borderRadius: 1,
                          fontSize: "0.8rem",
                          color: "primary.main", // 다운로드 가능함을 강조
                          cursor: "pointer",
                          "&:hover": { bgcolor: "#e3f2fd" },
                        }}
                        onClick={() => handleFileDownload(file)}
                      >
                        <AttachFileIcon fontSize="small" color="primary" />
                        <Typography
                          sx={{
                            flexGrow: 1,
                            fontSize: "inherit",
                            textDecoration: "underline",
                          }}
                        >
                          {file.name}
                        </Typography>
                        <Typography
                          sx={{ color: "text.secondary", fontSize: "0.75rem" }}
                        >
                          ({formatFileSize(file.size)})
                        </Typography>
                      </Stack>
                    </Tooltip>
                  ))}
                </Stack>
              )}

              <Typography
                sx={{ fontSize: "0.85rem", color: "text.disabled", mt: 1 }}
              >
                {comment.timestamp}
              </Typography>
            </Box>
          </Box>
        ))
      )}

      {/* 댓글 입력 영역 */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          alignItems: "start",
          mt: 5,
          pt: 3,
          borderTop: "1px solid #ddd",
        }}
      >
        <Avatar sx={{ width: 40, height: 40, bgcolor: "#e0e0e0" }}>👤</Avatar>

        <Box sx={{ flex: 1 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="댓글을 입력하세요..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: 1.5,
                bgcolor: "#fafafa",
              },
            }}
          />

          {/* 첨부 파일 영역 */}
          <Box
            sx={{
              border: "2px dashed #ccc",
              borderRadius: 2,
              p: 3,
              mb: 2,
              textAlign: "center",
              cursor: "default", // 입력 폼의 부모 Box는 클릭 막기
              "&:hover": { bgcolor: "#fff" },
            }}
          >
            {/* 파일 선택 버튼 레이블 */}
            <Input
              type="file"
              multiline
              onChange={handleFileChange}
              sx={{ display: "none" }}
              id="file-upload-input"
            />
            <label htmlFor="file-upload-input" style={{ cursor: "pointer" }}>
              <Stack spacing={1} alignItems="center">
                <CloudUploadIcon color="action" sx={{ fontSize: 40 }} />
                <Typography color="text.secondary" variant="body2">
                  등록 가능한 파일 형식: JPG, PNG, CSV / 총 업로드 용량 50MB
                  이하
                </Typography>
                <Button
                  variant="contained"
                  component="span" // label 클릭 시 Input 클릭을 유도
                  size="small"
                  sx={{ mt: 1 }}
                >
                  Browse files
                </Button>
              </Stack>
            </label>

            {/* 첨부 파일 목록 (삭제 버튼 추가) */}
            {attachedFiles.length > 0 && (
              <Stack
                spacing={0.5}
                sx={{
                  mt: 2,
                  borderTop: "1px solid #eee",
                  pt: 1,
                  textAlign: "left",
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                  첨부된 파일:
                </Typography>
                {attachedFiles.map((file) => (
                  <Stack
                    key={file.id}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ bgcolor: "#fafafa", p: 0.5, borderRadius: 1 }}
                  >
                    <Typography variant="caption" color="text.primary">
                      • {file.name} ({formatFileSize(file.size)})
                    </Typography>
                    {/* 삭제 버튼 */}
                    <IconButton
                      size="small"
                      onClick={() => handleFileRemove(file.id)}
                      sx={{ p: 0.5 }}
                    >
                      <CloseIcon fontSize="inherit" color="error" />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>
            )}
          </Box>

          {/* 버튼 영역 */}
          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleCancel}
              sx={{ borderRadius: 1.5 }}
            >
              취소
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleAddComment}
              disabled={!commentText.trim() && attachedFiles.length === 0}
              sx={{ borderRadius: 1.5 }}
            >
              저장
            </Button>
          </Box>
        </Box>
      </Box>

      {/* 메뉴 컴포넌트 (수정/삭제) */}
      <Menu anchorEl={anchorEl} open={openMenu} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            const commentToEdit = comments.find(
              (c) => c.id === currentCommentId
            );
            if (commentToEdit) handleEditStart(commentToEdit);
          }}
        >
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          수정
        </MenuItem>
        <MenuItem
          onClick={() => currentCommentId && handleDelete(currentCommentId)}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          삭제
        </MenuItem>
      </Menu>
    </Box>
  );
}
