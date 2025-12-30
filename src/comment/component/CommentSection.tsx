import { useEffect, useRef, useState } from "react";
import { Avatar, Box, Button, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import UploadFileIcon from "@mui/icons-material/UploadFile";

import { CommentItem } from "./CommentItem";

import {
  getExtensions,
  getFileSize,
} from "../../admin/setting/api/FileSettingApi";

import type { CommentDto, Mention } from "../type/type";
import MentionTextInput from "./mention/MentionTextInput";

// =====================================================================
//  Props
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
    removeFileIds: number[],
    mentionedMemberIds?: number[]
  ) => Promise<void>;

  onDeleteComment?: (commentId: number) => Promise<void>;
  currentMemberId?: number;
}

// =====================================================================
//  CommentSection
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
  /* =========================
     멘션 상태 (작성용)
  ========================= */
  const [mentions, setMentions] = useState<Mention[]>([]);

  /* =========================
     파일 업로드 상태
  ========================= */
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [maxFileSize, setMaxFileSize] = useState<number | null>(null);
  const [allowedExtensions, setAllowedExtensions] = useState<string[] | null>(
    null
  );

  /* =========================
     파일 설정 조회
  ========================= */
  useEffect(() => {
    async function fetchFileSetting() {
      const sizeConfig = await getFileSize();
      const extensionConfig = await getExtensions();

      const maxFileSizeByte = Number(sizeConfig.name);
      const maxFileSizeMB = maxFileSizeByte / 1024 / 1024;

      setMaxFileSize(maxFileSizeMB);
      setAllowedExtensions(extensionConfig.map((e) => e.name.toLowerCase()));
    }
    fetchFileSetting();
  }, []);

  /* =========================
     Drag & Drop
  ========================= */
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!e.dataTransfer.files) return;

    const droppedFiles = Array.from(e.dataTransfer.files);

    const validFiles = droppedFiles.filter((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      if (allowedExtensions && !allowedExtensions.includes(ext)) {
        alert(`허용되지 않은 확장자입니다: ${file.name}`);
        return false;
      }
      if (maxFileSize && file.size / 1024 / 1024 > maxFileSize) {
        alert(
          `${file.name} 파일의 크기가 최대 용량(${maxFileSize}MB)을 초과했습니다.`
        );
        return false;
      }
      return true;
    });

    setFiles((prev) => [...prev, ...validFiles]);
  };

  /* =========================
     렌더링
  ========================= */
  return (
    <Box>
      {/* ================= 댓글 목록 ================= */}
      {comments.map((c) => (
        <CommentItem
          key={c.id}
          comment={c}
          currentUserId={currentMemberId ?? -1}
          maxFileSize={maxFileSize}
          allowedExtensions={allowedExtensions}
          onUpdateComment={onUpdateComment}
          onDeleteComment={onDeleteComment}
        />
      ))}

      {/* ================= 댓글 입력 ================= */}
      {enableInput && (
        <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
          <Avatar sx={{ width: 40, height: 40 }}>👤</Avatar>

          <Box sx={{ flex: 1 }}>
            {/* ===== 멘션 입력 ===== */}
            <MentionTextInput
              value={commentText}
              onChange={(text) => onChangeText?.(text)}
              mentions={mentions}
              setMentions={setMentions}
              enableMention={enableMention}
              onAddMention={onAddMention}
              placeholder="댓글을 입력하세요"
            />

            {/* ===== 파일 업로드 ===== */}
            <Box sx={{ mt: 1 }}>
              <input
                type="file"
                multiple
                hidden
                ref={fileInputRef}
                onChange={(e) => {
                  if (!e.target.files) return;
                  setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
                }}
                onClick={(e) => (e.currentTarget.value = "")}
              />

              <Box
                sx={{
                  border: "2px dashed #d0d0d0",
                  borderRadius: 2,
                  p: 2,
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor: "#fafafa",
                    borderColor: "#999",
                  },
                }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <UploadFileIcon
                  sx={{ fontSize: 36, color: "#9e9e9e", mb: 0.5 }}
                />
                <Typography sx={{ fontSize: "0.875rem", fontWeight: 500 }}>
                  파일 첨부
                </Typography>

                {maxFileSize && allowedExtensions && (
                  <Typography
                    sx={{
                      mt: 0.5,
                      fontSize: "0.75rem",
                      color: "text.secondary",
                    }}
                  >
                    최대 파일 크기: {maxFileSize}MB <br />
                    허용 확장자: .{allowedExtensions.join(", .")}
                  </Typography>
                )}
              </Box>

              {/* 첨부된 파일 목록 */}
              {files.map((file, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 1.2,
                    bgcolor: "#f5f5f5",
                    borderRadius: 1.5,
                    mb: 1,
                  }}
                >
                  <Typography
                    sx={{ fontSize: "0.85rem", fontWeight: 500 }}
                    noWrap
                  >
                    {file.name}
                  </Typography>

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

            {/* ===== 저장 버튼 ===== */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
              <Button
                size="small"
                variant="contained"
                disabled={!commentText.trim() && files.length === 0}
                onClick={async () => {
                  if (!commentText.trim() && files.length === 0) {
                    alert("내용 또는 파일을 입력하세요.");
                    return;
                  }
                  await onSubmit?.(files);
                  setFiles([]);
                  setMentions([]);
                  onChangeText?.("");
                }}
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
