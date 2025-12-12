import {
  Box,
  Avatar,
  Typography,
  TextField,
  Button,
  IconButton,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useState } from "react";

interface Comment {
  id: number;
  author: string;
  content: string;
  timestamp: string;
  avatar: string;
}

export default function TabComment() {
  const [commentText, setCommentText] = useState("");

  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      author: "홍길동 대리",
      content:
        "Ultricies ultricies interdum dolor sodales. Vitae feugiat vitae vitae quis id consectetur. Aenean urna, lectus enim suscipit eget. Tristique bibendum nibh enim dui.",
      timestamp: "2025.11.11 15:32",
      avatar: "👤",
    },
  ]);

  const handleAddComment = () => {
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: comments.length + 1,
      author: "홍길동 대리",
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
    };

    setComments([...comments, newComment]);
    setCommentText("");
  };

  return (
    <Box>
      {/* 댓글 목록 */}
      {comments.map((comment) => (
        <Box key={comment.id} sx={{ mb: 3, display: "flex", gap: 2 }}>
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
              <Typography sx={{ fontWeight: 600 }}>{comment.author}</Typography>

              <IconButton size="small">
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>

            <Typography
              sx={{
                color: "text.secondary",
                mb: 1,
                lineHeight: 1.6,
              }}
            >
              {comment.content}
            </Typography>

            <Typography sx={{ fontSize: "0.85rem", color: "text.disabled" }}>
              {comment.timestamp}
            </Typography>
          </Box>
        </Box>
      ))}

      {/* 댓글 입력 */}
      <Box sx={{ display: "flex", gap: 2, alignItems: "start", mt: 3 }}>
        <Avatar sx={{ width: 40, height: 40, bgcolor: "#e0e0e0" }}>👤</Avatar>

        <Box sx={{ flex: 1 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="@홍"
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

          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
            <Button variant="outlined" size="small" sx={{ borderRadius: 1.5 }}>
              취소
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleAddComment}
              sx={{ borderRadius: 1.5 }}
            >
              저장
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
