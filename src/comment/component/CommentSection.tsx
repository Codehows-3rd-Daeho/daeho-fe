
import { useEffect, useRef, useState } from "react";
import type { CommentDto, MentionMemberDto } from "../type/type"; // type 경로 확인
import { searchMembersForMention } from "../api/CommentApi"; // api 경로 확인
import {
  Avatar,
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

// ✨ 분리된 CommentItem 컴포넌트와 Props 인터페이스를 불러옴
import { CommentItem } from "./CommentItem"; // 경로 확인

// =====================================================================
// 3. CommentSection Props 인터페이스
// =====================================================================

interface Props {
  comments?: CommentDto[];
  enableInput?: boolean;
  enableMention?: boolean;
  commentText?: string;
  onChangeText?: (text: string) => void;
  onSubmit?: (files: File[]) => void;
  onAddMention?: (memberId: number) => void;

  onUpdateComment?: (
    commentId: number,
    content: string,
    newFiles: File[],
    removeFileIds: number[]
  ) => Promise<void>;
  onDeleteComment?: (commentId: number) => Promise<void>;
  currentMemberId?: number;
}

// =====================================================================
// 4. CommentSection 메인 컴포넌트
// =====================================================================

export default function CommentSection({
  comments = [],
  enableInput = true,
  enableMention = false,
  commentText = "",
  onChangeText,
  onSubmit,
  onAddMention,
  onUpdateComment,
  onDeleteComment,
  currentMemberId,
}: Props) {

  const [mentionKeyword, setMentionKeyword] = useState<string | null>(null);
  const [mentionList, setMentionList] = useState<MentionMemberDto[]>([]);
  const [showMentionBox, setShowMentionBox] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const mentionBoxRef = useRef<HTMLDivElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /* =========================
     멘션 외부 클릭 닫기
  ========================= */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        mentionBoxRef.current &&
        !mentionBoxRef.current.contains(e.target as Node)
      ) {
        setShowMentionBox(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* =========================
     입력 변경 + 멘션 검색
  ========================= */
  const handleChange = async (value: string) => {
    onChangeText?.(value);

    if (!enableMention) return;

    const match = value.match(/@([가-힣a-zA-Z0-9_]*)$/);
    if (!match) {
      setShowMentionBox(false);
      return;
    }

    const keyword = match[1];
    setMentionKeyword(keyword);

    if (keyword.length === 0) {
      setShowMentionBox(false);
      return;
    }

    const data = await searchMembersForMention(keyword);
    setMentionList(data);
    setShowMentionBox(true);
  };

  return (
    <Box>
      {/* ================= 댓글 목록 ================= */}
      {comments.map((c) => (
        <CommentItem 
          key={c.id}
          comment={c}
          currentUserId={currentMemberId ?? -1}
          onUpdateComment={onUpdateComment}
          onDeleteComment={onDeleteComment}
        />
      ))}

      {/* ================= 입력 영역 ================= */}
      {enableInput && (
        <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
          <Avatar sx={{ width: 40, height: 40 }}>👤</Avatar>

          <Box sx={{ flex: 1, position: "relative" }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="댓글을 입력하세요"
              value={commentText}
              inputRef={inputRef}
              onChange={(e) => handleChange(e.target.value)}
            />

            {/* 첨부파일 영역 */}
            <Box sx={{ mt: 1 }}>
              <Button
                size="small"
                onClick={() => fileInputRef.current?.click()}
              >
                파일 첨부
              </Button>

              <input
                type="file"
                multiple
                hidden
                id="comment-file"
                ref={fileInputRef}
                onChange={(e) => {
                  if (!e.target.files) return;
                  // Array.from() 대신 스프레드 문법 사용
                  setFiles((prev) => [...prev, ...e.target.files!]); 
                }}
                onClick={(e) => (e.currentTarget.value = "")}
              />

              {/* 첨부된 파일 목록 (삭제 버튼 포함) */}
              {files.map((file, idx) => (
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
                    onClick={() =>
                      setFiles((prev) => prev.filter((_, i) => i !== idx))
                    }
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>

            {/* ===== 멘션 박스 ===== */}
            {enableMention && showMentionBox && mentionList.length > 0 && (
              <Box
                ref={mentionBoxRef}
                sx={{
                  position: "absolute",
                  bottom: "100%", 
                  left: 12,
                  mb: 0.5,
                  backgroundColor: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: 1,
                  boxShadow: 3,
                  width: 300,
                  maxHeight: 56 * 5,
                  overflowY: "auto",
                  zIndex: 1300,
                }}
              >
                {mentionList.map((m) => (
                  <Box
                    key={m.id}
                    sx={{
                      px: 2,
                      py: 1,
                      height: 56,
                      cursor: "pointer",
                      "&:hover": { backgroundColor: "#f5f5f5" },
                    }}
                    onClick={() => {
                      if (!mentionKeyword || !onChangeText) return;

                      onChangeText(
                        commentText.replace(
                          new RegExp(`@${mentionKeyword}$`),
                          `@${m.name} `
                        )
                      );

                      onAddMention?.(m.id);
                      setShowMentionBox(false);
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

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
              <Button
                size="small"
                variant="contained"
                onClick={async () => {
                  if (!commentText?.trim() && files.length === 0) {
                    alert("내용 또는 파일을 입력하세요.");
                    return;
                  }

                  await onSubmit?.(files);
                  setFiles([]);
                  onChangeText?.("");
                }}
                disabled={!commentText?.trim() && files.length === 0}
              >
                저장
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}