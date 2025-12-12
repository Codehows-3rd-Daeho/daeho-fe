// common/comment/CommentSection.tsx
import {
  Box,
  Avatar,
  Typography,
  TextField,
  Button,
  IconButton,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import type { CommentDto } from "../type/type";

interface Props {
  comments: CommentDto[];
  commentText: string;
  hasMore: boolean;

  onChangeText: (text: string) => void;
  onLoadMore: () => void;
  onSubmit: () => void;
}

export default function CommentSection({
  comments,
  commentText,
  hasMore,
  onChangeText,
  onLoadMore,
  onSubmit,
}: Props) {
  return (
    <Box>
      {/* 댓글 목록 */}
      {comments.map((c) => (
        <Box key={c.id} sx={{ mb: 3, display: "flex", gap: 2 }}>
          <Avatar sx={{ width: 40, height: 40, bgcolor: "#e0e0e0" }}>👤</Avatar>

          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 0.5,
              }}
            >
              <Typography sx={{ fontWeight: 600 }}>{c.writerName}</Typography>

              <IconButton size="small">
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>

            <Typography sx={{ color: "text.secondary", mb: 1 }}>
              {c.content}
            </Typography>

            <Typography sx={{ fontSize: "0.85rem", color: "text.disabled" }}>
              {c.createdAt?.slice(0, 16).replace("T", " ")}
            </Typography>
          </Box>
        </Box>
      ))}

      {/* 더보기 */}
      {hasMore && (
        <Button
          fullWidth
          variant="outlined"
          sx={{ mt: 1 }}
          onClick={onLoadMore}
        >
          더 보기
        </Button>
      )}

      {/* 입력 */}
      <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
        <Avatar sx={{ width: 40, height: 40, bgcolor: "#e0e0e0" }}>👤</Avatar>

        <Box sx={{ flex: 1 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="댓글을 입력하세요"
            value={commentText}
            onChange={(e) => onChangeText(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button variant="outlined" size="small">
              취소
            </Button>
            <Button variant="contained" size="small" onClick={onSubmit}>
              저장
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
