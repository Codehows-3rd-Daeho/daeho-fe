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
  const [selectedIndex, setSelectedIndex] = useState(0); // 멘션 선택인덱스

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mentionBoxRef = useRef<HTMLDivElement | null>(null);

  const backdropRef = useRef<HTMLDivElement | null>(null); // 스크롤 동기화용 리프 추가

  // 스크롤 동기화 함수: 입력창을 내리면 하이라이트 레이어도 같이 내려가야 함
  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    if (backdropRef.current) {
      backdropRef.current.scrollTop = (e.target as HTMLElement).scrollTop;
    }
  };

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

  useEffect(() => {
    if (!showMentionBox) return;

    // selectedIndex가 바뀔 때 스크롤 이동
    const el = itemRefs.current[selectedIndex];
    if (el) {
      el.scrollIntoView({
        block: "nearest",
      });
    }
  }, [selectedIndex, showMentionBox]);

  /* =========================
     멘션 하이라이트 렌더
  ========================= */
  const renderMentionText = (text: string, mentions: Mention[]) => {
    if (!mentions.length) return text;
    const mentionNames = mentions.map((m) => `@${m.name}`);
    const regex = new RegExp(`(${mentionNames.join("|")})`, "g");
    const parts = text.split(regex);

    return parts.map((part, idx) => {
      const isMention = mentionNames.includes(part);
      return (
        <span
          key={idx}
          style={{
            color: isMention ? "#1976d2" : "#333",
            fontWeight: isMention ? 700 : 400,
            backgroundColor: isMention
              ? "rgba(25, 118, 210, 0.1)"
              : "transparent",
          }}
        >
          {part}
        </span>
      );
    });
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
      setSelectedIndex(0);
      setShowMentionBox(true);
    } catch (error) {
      const apiError = error as ApiError;
      const response = apiError.response?.data?.message;

      alert(response ?? "오류가 발생했습니다.");
    }
  };

  // 멘션 선택 로직 함수로 분리
  const selectMention = (m: MentionMemberDto) => {
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

    setMentions((prev) => [...prev, { memberId: m.id, name: m.name }]);

    onAddMention?.(m.id);
    setShowMentionBox(false);

    setTimeout(() => inputRef.current?.focus(), 0);
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
    wordBreak: "break-word" as const,
    boxSizing: "border-box" as const,
  };

  return (
    <Box sx={{ position: "relative", width: "100%" }}>
      {/* 하이라이트 레이어 */}
      <Box
        ref={backdropRef}
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          padding: "16.5px 14px",
          pointerEvents: "none",
          overflow: "hidden",
          backgroundColor: "#fff",
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
        onScroll={handleScroll}
        onKeyDown={(e) => {
          if (!showMentionBox || mentionList.length === 0) return;

          if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((prev) =>
              prev < mentionList.length - 1 ? prev + 1 : prev
            );
          }

          if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
          }

          if (e.key === "Enter") {
            e.preventDefault();
            const selected = mentionList[selectedIndex];
            if (selected) {
              selectMention(selected);
            }
          }

          if (e.key === "Escape") {
            setShowMentionBox(false);
          }
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            zIndex: 2,
            backgroundColor: "transparent", // 배경을 투명하게 고정
            "& fieldset": { borderColor: "#ddd" },
            "&.Mui-focused": {
              backgroundColor: "transparent", // 포커스 시에도 배경 투명 유지
            },
          },
          "& textarea": {
            ...textStyle,
            color: "transparent",
            caretColor: "#000",
            zIndex: 3,
            "&::selection": {
              backgroundColor: "rgba(25, 118, 210, 0.2)", // 텍스트 드래그 시 선택 영역은 보이게
            },
          },
        }}
      />

      {/* 멘션 박스 */}
      {enableMention && showMentionBox && (
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
          {mentionList.length === 0 ? (
            <Typography sx={{ p: 2 }} color="text.secondary">
              검색 결과가 없습니다
            </Typography>
          ) : (
            mentionList.map((m, idx) => (
              <Box
                key={m.id}
                ref={(el) => {
                  itemRefs.current[idx] = el as HTMLDivElement | null;
                }}
                sx={{
                  px: 2,
                  py: 1,
                  height: 56,
                  cursor: "pointer",
                  backgroundColor:
                    idx === selectedIndex ? "#e3f2fd" : "transparent",
                  "&:hover": { backgroundColor: "#f5f5f5" },
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
                onClick={() => selectMention(m)}
              >
                <Typography fontWeight={500}>
                  {m.name} {m.jobPositionName}
                </Typography>
                <Typography fontSize="0.8rem" color="text.secondary">
                  {m.departmentName}
                </Typography>
              </Box>
            ))
          )}
        </Box>
      )}
    </Box>
  );
}
