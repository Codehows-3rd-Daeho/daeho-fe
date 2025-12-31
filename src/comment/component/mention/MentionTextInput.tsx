import { useEffect, useRef, useState } from "react";
import { Box, TextField, Typography } from "@mui/material";
import type { Mention, MentionMemberDto } from "../../type/type";
import { searchMembersForMention } from "../../api/CommentApi";
import type { ApiError } from "../../../config/httpClient";

interface MentionTextInputProps {
  value: string;
  onChange: (text: string) => void;
  mentions: Mention[];
  setMentions: React.Dispatch<React.SetStateAction<Mention[]>>;
  enableMention?: boolean;
  onAddMention?: (memberId: number) => void;
  placeholder?: string;
  rows?: number;
}

export default function MentionTextInput({
  value,
  onChange,
  mentions,
  setMentions,
  enableMention = false,
  onAddMention,
  placeholder = "입력하세요",
  rows = 3,
}: MentionTextInputProps) {
  const [mentionKeyword, setMentionKeyword] = useState<string | null>(null);
  const [mentionList, setMentionList] = useState<MentionMemberDto[]>([]);
  const [showMentionBox, setShowMentionBox] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const mentionBoxRef = useRef<HTMLDivElement | null>(null);

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
     멘션 하이라이트 렌더
  ========================= */
  const renderMentionText = (text: string, mentions: Mention[]) => {
    if (!mentions.length)
      return <span style={{ color: "transparent" }}>{text}</span>; // 전체 투명

    const nodes: React.ReactNode[] = [];
    let cursor = 0;

    mentions.forEach((m, idx) => {
      const mentionText = `@${m.name}`;
      const index = text.indexOf(mentionText, cursor);
      if (index === -1) return;

      nodes.push(
        <span key={`text-${idx}`} style={{ color: "transparent" }}>
          {text.slice(cursor, index)}
        </span>
      );

      nodes.push(
        <span
          key={`mention-${m.memberId}-${idx}`}
          style={{
            color: "#1976d2",
            fontWeight: 700,
            backgroundColor: "rgba(25, 118, 210, 0.1)",
          }}
        >
          {mentionText}
        </span>
      );
      cursor = index + mentionText.length;
    });

    nodes.push(
      <span key="last" style={{ color: "transparent" }}>
        {text.slice(cursor)}
      </span>
    );
    return nodes;
  };

  /* =========================
     입력 변경 + 멘션 검색
  ========================= */
  const handleChange = async (text: string) => {
    onChange(text);

    // 삭제된 멘션 정리
    setMentions((prev) => prev.filter((m) => text.includes(`@${m.name}`)));

    if (!enableMention || !inputRef.current) return;

    const cursorPosition = inputRef.current.selectionStart;
    const textBeforeCursor = text.slice(0, cursorPosition);

    const match = textBeforeCursor.match(/@([가-힣a-zA-Z0-9_]*)$/);

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
    try {
      const data = await searchMembersForMention(keyword);
      setMentionList(data);
      setShowMentionBox(true);
    } catch (error) {
      const apiError = error as ApiError;
      const response = apiError.response?.data?.message;

      alert(response ?? "오류가 발생했습니다.");
    }
  };

  /* =========================
     스타일
  ========================= */
  const textStyle = {
    fontFamily: "Roboto, Helvetica, Arial, sans-serif",
    fontSize: "0.875rem",
    lineHeight: "1.4375em",
    letterSpacing: "0.01071em",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  };

  return (
    <Box sx={{ position: "relative", width: "100%" }}>
      {/* 하이라이트 레이어 */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0, // inset: 0과 동일, 높이를 TextField와 맞춤
          padding: "16.5px 14px",
          pointerEvents: "none",
          overflow: "hidden", // 레이어 밖으로 나가는 글자 숨김
          backgroundColor: "transparent",
          zIndex: 1,
          ...textStyle,
        }}
      >
        {renderMentionText(value, mentions)}
      </Box>

      {/* 실제 입력 */}
      <TextField
        fullWidth
        multiline
        minRows={rows}
        value={value}
        placeholder={placeholder}
        inputRef={inputRef}
        onChange={(e) => handleChange(e.target.value)}
        sx={{
          "& .MuiOutlinedInput-root": {
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderWidth: "1px",
            },
          },
          "& textarea": {
            caretColor: "#000",
            color: "#333",
            ...textStyle,
            overflow: "hidden !important",
          },
        }}
      />

      {/* 멘션 박스 */}
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
                if (mentionKeyword === null || !inputRef.current) return;

                const cursorPosition = inputRef.current.selectionStart;
                const textBeforeCursor = value.slice(0, cursorPosition);
                const textAfterCursor = value.slice(cursorPosition);

                const newBeforeCursor = textBeforeCursor.replace(
                  new RegExp(`@${mentionKeyword}$`),
                  `@${m.name} `
                );

                const nextText = newBeforeCursor + textAfterCursor;
                onChange(nextText);

                setMentions((prev) => [
                  ...prev,
                  { memberId: m.id, name: m.name },
                ]);

                onAddMention?.(m.id);
                setShowMentionBox(false);

                setTimeout(() => inputRef.current?.focus(), 0);
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
    </Box>
  );
}
