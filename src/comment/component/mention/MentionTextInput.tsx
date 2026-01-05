import { useEffect, useRef, useState, useMemo } from "react";
import { Box, TextField, Typography } from "@mui/material";
import type { Mention, MentionMemberDto } from "../../type/type";

interface MentionTextInputProps {
  value: string;
  onChange: (text: string) => void;
  mentions: Mention[];
  setMentions: React.Dispatch<React.SetStateAction<Mention[]>>;
  enableMention?: boolean;
  onAddMention?: (memberId: number) => void;
  placeholder?: string;
  rows?: number;
  memberList?: MentionMemberDto[]; 
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
  memberList = [],
}: MentionTextInputProps) {
  const [mentionKeyword, setMentionKeyword] = useState<string | null>(null);
  const [showMentionBox, setShowMentionBox] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // ✅ 이 부분이 올바르게 수정되었습니다.
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mentionBoxRef = useRef<HTMLDivElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);

  const filteredMentionList = useMemo(() => {
    if (mentionKeyword === null) return [];
    
    return memberList.filter((member) =>
      member.name.toLowerCase().includes(mentionKeyword.toLowerCase()) ||
      member.departmentName.toLowerCase().includes(mentionKeyword.toLowerCase())
    );
  }, [mentionKeyword, memberList]);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    if (backdropRef.current) {
      backdropRef.current.scrollTop = (e.target as HTMLElement).scrollTop;
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mentionBoxRef.current && !mentionBoxRef.current.contains(e.target as Node)) {
        setShowMentionBox(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (showMentionBox && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex, showMentionBox]);

  /* 멘션 텍스트 하이라이트 (안전한 버전) */
  const renderMentionText = (text: string, mentions: Mention[]) => {
    // 1. 텍스트가 없거나 멘션이 없으면 그대로 반환
    if (!text) return "";
    if (!mentions || mentions.length === 0) return text;

    try {
      // 2. 멘션 이름들만 추출하여 정규식 패턴 생성 (@이름)
      // 특수문자가 섞일 수 있으므로 Escape 처리 (필요시)
      const mentionNames = mentions
        .map((m) => m.name ? `@${m.name}` : null)
        .filter(Boolean) as string[];

      if (mentionNames.length === 0) return text;

      // 정규식 예약어 처리를 위해 escape 후 합침
      const pattern = mentionNames
        .map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join("|");
      
      const regex = new RegExp(`(${pattern})`, "g");
      const parts = text.split(regex);

      return parts.map((part, idx) => {
        const isMention = mentionNames.includes(part);
        return (
          <span
            key={`${part}-${idx}`} // key값 고유화
            style={{
              color: isMention ? "#1976d2" : "inherit",
              fontWeight: isMention ? 700 : 400,
              backgroundColor: isMention ? "rgba(25, 118, 210, 0.1)" : "transparent",
            }}
          >
            {part}
          </span>
        );
      });
    } catch (error) {
      console.error("Rendering mention text error:", error);
      return text; // 에러 발생 시 원문 텍스트라도 보여줌
    }
  };

  const handleChange = (text: string) => {
    onChange(text);
    setMentions((prev) => prev.filter((m) => text.includes(`@${m.name}`)));

    if (!enableMention || !inputRef.current) return;

    const cursorPosition = inputRef.current.selectionStart;
    const textBeforeCursor = text.slice(0, cursorPosition);
    const match = textBeforeCursor.match(/@([가-힣a-zA-Z0-9_]*)$/);

    if (!match) {
      setShowMentionBox(false);
      setMentionKeyword(null);
      return;
    }

    const keyword = match[1];
    setMentionKeyword(keyword);
    setSelectedIndex(0);
    setShowMentionBox(true); 
  };

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

    setMentions((prev) => {
      if (prev.find(p => p.memberId === m.id)) return prev;
      return [...prev, { memberId: m.id, name: m.name }];
    });

    onAddMention?.(m.id);
    setShowMentionBox(false);
    setMentionKeyword(null);

    setTimeout(() => inputRef.current?.focus(), 0);
  };

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
      <Box
        ref={backdropRef}
        sx={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
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
          if (!showMentionBox || filteredMentionList.length === 0) return;

          if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((prev) =>
              prev < filteredMentionList.length - 1 ? prev + 1 : prev
            );
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
          }
          if (e.key === "Enter") {
            e.preventDefault();
            const selected = filteredMentionList[selectedIndex];
            if (selected) selectMention(selected);
          }
          if (e.key === "Escape") {
            setShowMentionBox(false);
          }
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            zIndex: 2,
            backgroundColor: "transparent",
            "& fieldset": { borderColor: "#ddd" },
          },
          "& textarea": {
            ...textStyle,
            color: "transparent",
            caretColor: "#000",
            zIndex: 3,
          },
        }}
      />

      {enableMention && showMentionBox && (
        <Box
          ref={mentionBoxRef}
          sx={{
            position: "absolute",
            bottom: "100%",
            left: 0,
            mb: 0.5,
            backgroundColor: "#fff",
            border: "1px solid #ddd",
            borderRadius: 1,
            boxShadow: 3,
            width: "100%",
            maxWidth: 320,
            maxHeight: 280,
            overflowY: "auto",
            zIndex: 1300,
          }}
        >
          {filteredMentionList.length === 0 ? (
            <Typography sx={{ p: 2 }} color="text.secondary">
              검색 결과가 없습니다
            </Typography>
          ) : (
            filteredMentionList.map((m, idx) => (
              <Box
                key={m.id}
                ref={(el: HTMLDivElement | null) => {
                  itemRefs.current[idx] = el;
                }}
                sx={{
                  px: 2, py: 1.5,
                  cursor: "pointer",
                  backgroundColor: idx === selectedIndex ? "#e3f2fd" : "transparent",
                  "&:hover": { backgroundColor: "#f5f5f5" },
                  borderBottom: "1px solid #f0f0f0"
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
                onClick={() => selectMention(m)}
              >
                <Typography variant="body2" fontWeight={600}>
                  {m.name} {m.jobPositionName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
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