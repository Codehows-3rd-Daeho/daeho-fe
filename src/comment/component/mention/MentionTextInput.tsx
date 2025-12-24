import { useEffect, useRef, useState } from "react";
import { Box, TextField, Typography } from "@mui/material";
import type { Mention, MentionMemberDto } from "../../type/type";
import { searchMembersForMention } from "../../api/CommentApi";

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
    if (!mentions.length) return text;

    const nodes: React.ReactNode[] = [];
    let cursor = 0;

    mentions.forEach((m, idx) => {
      const mentionText = `@${m.name}`;
      const index = text.indexOf(mentionText, cursor);
      if (index === -1) return;

      nodes.push(<span key={`text-${idx}`}>{text.slice(cursor, index)}</span>);
      nodes.push(
        <span
          key={`mention-${m.memberId}-${idx}`}
          style={{ color: "#1976d2", fontWeight: 500 }}
        >
          {mentionText}
        </span>
      );
      cursor = index + mentionText.length;
    });

    nodes.push(<span key="last">{text.slice(cursor)}</span>);
    return nodes;
  };

  /* =========================
     입력 변경 + 멘션 검색
  ========================= */
  const handleChange = async (text: string) => {
    onChange(text);

    // 삭제된 멘션 정리
    setMentions((prev) => prev.filter((m) => text.includes(`@${m.name}`)));

    if (!enableMention) return;

    const match = text.match(/@([가-힣a-zA-Z0-9_]*)$/);
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
    <Box sx={{ position: "relative" }}>
      {/* 하이라이트 레이어 */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          padding: "16.5px 14px",
          pointerEvents: "none",
          color: "#000",
          overflow: "hidden",
          ...textStyle,
        }}
      >
        {renderMentionText(value, mentions)}
      </Box>

      {/* 실제 입력 */}
      <TextField
        fullWidth
        multiline
        rows={rows}
        value={value}
        placeholder={placeholder}
        inputRef={inputRef}
        onChange={(e) => handleChange(e.target.value)}
        sx={{
          "& textarea": {
            color: "transparent",
            caretColor: "#000",
            ...textStyle,
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
                if (!mentionKeyword) return;

                const nextText = value.replace(
                  new RegExp(`@${mentionKeyword}$`),
                  `@${m.name} `
                );

                onChange(nextText);

                setMentions((prev) => [
                  ...prev,
                  { memberId: m.id, name: m.name },
                ]);

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
    </Box>
  );
}
