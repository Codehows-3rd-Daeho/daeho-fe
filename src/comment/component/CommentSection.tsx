import {
  Box,
  Avatar,
  Typography,
  TextField,
  Button,
  IconButton,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import type { CommentDto, MentionMemberDto } from "../type/type";
import { useState } from "react";
import { searchMembersForMention } from "../api/CommentApi";

interface Props {
  comments: CommentDto[];
  commentText: string;
  hasMore: boolean;

  onChangeText: (text: string) => void;
  onLoadMore: () => void;
  onSubmit: () => void;
  onAddMention: (memberId: number) => void;
}

export default function CommentSection({
  comments,
  commentText,
  onChangeText,
  onSubmit,
  onAddMention,
}: Props) {
  const [mentionKeyword, setMentionKeyword] = useState<string | null>(null);
  const [mentionList, setMentionList] = useState<MentionMemberDto[]>([]);
  const [showMentionBox, setShowMentionBox] = useState(false);

  const handleChange = async (value: string) => {
    onChangeText(value);

    const match = value.match(/@([가-힣a-zA-Z0-9_]*)$/);
    if (!match) {
      setShowMentionBox(false);
      return;
    }

    const keyword = match[1];
    setMentionKeyword(keyword);

    if (!keyword) return;

    const data = await searchMembersForMention(keyword);
    setMentionList(data);
    setShowMentionBox(true);

    setMentionList(data);
    setShowMentionBox(true);
  };

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
              <Typography sx={{ fontWeight: 600 }}>
                {c.writerName}
                {c.writerJPName}
              </Typography>

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
            onChange={(e) => handleChange(e.target.value)}
            sx={{ mb: 2 }}
          />
          {showMentionBox && mentionList.length > 0 && (
            <Box
              sx={{
                position: "absolute",
                backgroundColor: "#fff",
                border: "1px solid #ddd",
                borderRadius: 1,
                boxShadow: 3,
                width: 300,
                zIndex: 10,
              }}
            >
              {mentionList.map((m) => (
                <Box
                  key={m.id}
                  sx={{
                    px: 2,
                    py: 1,
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "#f5f5f5" },
                  }}
                  onClick={() => {
                    if (!mentionKeyword) return;

                    onChangeText(
                      commentText.replace(
                        new RegExp(`@${mentionKeyword}$`),
                        `@${m.name} `
                      )
                    );

                    onAddMention(m.id);
                    setShowMentionBox(false);
                    setMentionKeyword(null);
                  }}
                >
                  <Typography fontWeight={500}>
                    {m.name} {m.jobPositionName}
                  </Typography>
                  <Typography fontSize="0.8rem" color="text.secondary">
                    {m.departmentName}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}

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
