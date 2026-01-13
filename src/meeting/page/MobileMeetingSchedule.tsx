import type { useNavigate } from "react-router-dom";
import type { MeetingListItem } from "../type/type";
import { Box, Typography, IconButton, Popover } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { PageHeader } from "../../common/PageHeader/PageHeader";
import { AddButton } from "../../common/PageHeader/AddButton/Addbutton";
import LockIcon from "@mui/icons-material/Lock";
import { useState, useRef } from "react";
import { updateMeetingColor } from "../api/MeetingApi";

interface MobileScheduleProps {
  year: number;
  month: number;
  monthDays: Date[];
  meetingsByDay: Map<number, MeetingListItem[]>;
  expandedDays: Set<number>;
  toggleExpand: (day: number) => void;
  isTodayDate: (date: Date) => boolean;
  getDayColor: (date: Date) => string;
  formatDate: (date: Date) => string;
  setCurrent: React.Dispatch<React.SetStateAction<Date>>;
  navigate: ReturnType<typeof useNavigate>;
}

// 색상 파레트
const COLOR_PALETTE = [
  { name: "기본", color: "#4b6485" },
  { name: "빨강", color: "#ef4444" },
  { name: "주황", color: "#f97316" },
  { name: "노랑", color: "#eab308" },
  { name: "초록", color: "#22c55e" },
  { name: "파랑", color: "#3b82f6" },
  { name: "남색", color: "#6366f1" },
  { name: "보라", color: "#a855f7" },
  { name: "분홍", color: "#ec4899" },
];

export default function MobileMeetingSchedule({
  year,
  month,
  monthDays,
  meetingsByDay,
  expandedDays,
  toggleExpand,
  isTodayDate,
  getDayColor,
  formatDate,
  setCurrent,
  navigate,
}: MobileScheduleProps) {
  // 색상 선택 메뉴 상태
  const [colorMenu, setColorMenu] = useState<{
    anchorEl: HTMLElement;
    meetingId: number;
  } | null>(null);

  // Long press 관련 상태
  const longPressTimer = useRef<number | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);

  // Long press 시작
  const handleTouchStart = (
    event: React.TouchEvent<HTMLDivElement>,
    meetingId: number
  ) => {
    // event.preventDefault();
    setIsLongPressing(false);

    longPressTimer.current = setTimeout(() => {
      setIsLongPressing(true);
      // 진동 피드백 (지원되는 경우)
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      
      setColorMenu({
        anchorEl: event.currentTarget,
        meetingId,
      });
    }, 500); // 500ms 길게 누르기
  };

  // Long press 취소
  const handleTouchEnd = (meetingId: number) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // Long press가 아니었다면 상세 페이지로 이동
    if (!isLongPressing) {
      navigate(`/meeting/${meetingId}`);
    }
    setIsLongPressing(false);
  };

  // Long press 취소 (터치 이동 시)
  const handleTouchMove = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleColorSelect = async (color: string) => {
    if (!colorMenu) return;

    try {
      // 백엔드 API 호출
      await updateMeetingColor(colorMenu.meetingId, color);

      for (const [, meetings] of meetingsByDay.entries()) {
        const meeting = meetings.find(m => m.id === colorMenu.meetingId);
        if (meeting) {
          meeting.color = color;
          break;
        }
      }
    } catch (error: any) {
      console.error("색상 변경 오류:", error);
      // Axios 에러 응답에서 메시지 추출
      const errorMessage = error.response?.data || "색상 변경에 실패했습니다.";
      alert(errorMessage);
    } finally {
      setColorMenu(null);
    }
  };

  const handleCloseColorMenu = () => {
    setColorMenu(null);
  };

  return (
    <Box
      sx={{
        maxWidth: 800,
        mx: "auto",
        minHeight: "100vh",
      }}
    >
      {/* 헤더 */}
      <Box
        sx={{
          backgroundColor: "none",
          p: 2,
          mb: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <IconButton onClick={() => setCurrent(new Date(year, month - 1, 1))}>
          <ChevronLeftIcon />
        </IconButton>

        <Typography fontSize={20} fontWeight={600}>
          {year}년 {month + 1}월
        </Typography>

        <IconButton onClick={() => setCurrent(new Date(year, month + 1, 1))}>
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {/* 등록 버튼 */}
      <PageHeader>
        {() => (
          <>
            <Box />
            <AddButton onClick={() => navigate("/meeting/create")} />
          </>
        )}
      </PageHeader>

      {/* 일정 리스트 */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        {monthDays.map((date, index) => {
          const day = date.getDate();
          const dayMeetings = meetingsByDay.get(day) || [];
          const today = isTodayDate(date);
          const dayColor = getDayColor(date);
          const isExpanded = expandedDays.has(day);
          const visibleMeetings = isExpanded
            ? dayMeetings
            : dayMeetings.slice(0, 3);
          return (
            <Box
              key={index}
              sx={{
                backgroundColor: "#fff",
                borderRadius: 2,
                p: 2,
                border: today ? "2px solid #2563eb" : "1px solid #e5e7eb",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                display: "flex",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  minWidth: 90,
                  textAlign: "center",
                  color: dayColor,
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                <Typography
                  fontSize={18}
                  fontWeight={600}
                  sx={{ color: dayColor }}
                >
                  {formatDate(date)}
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                {dayMeetings.length > 0 ? (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    {visibleMeetings.map((meeting) => (
                      <Box
                        key={meeting.id}
                        sx={{
                          p: 1,
                          mb: 1,
                          borderRadius: 1,
                          borderLeft: `4px solid ${
                            meeting.color || "#4b6485"
                          }`,
                          boxShadow: "0 1px 4px rgba(0, 0, 0, 0.06)",
                          color: "#fff",
                          cursor: "pointer",
                          // Long press 중일 때 시각적 피드백
                          opacity: isLongPressing ? 0.7 : 1,
                          transition: "opacity 0.2s",
                          touchAction: "none",
                          userSelect: "none",
                          WebkitUserSelect: "none",
                          WebkitTouchCallout: "none",
                        }}
                        onTouchStart={(e) => handleTouchStart(e, meeting.id)}
                        onTouchEnd={() => handleTouchEnd(meeting.id)}
                        onTouchMove={handleTouchMove}
                        onContextMenu={(e) => e.preventDefault()}
                      >
                        {/* 회의 card*/}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            gridTemplateColumns: "auto 1fr",
                            gap: 1,
                            mb: 1,
                            width: "100%",
                          }}
                        >
                          <Typography
                            fontSize={14}
                            sx={{
                              color: "black",
                              minWidth: 0,
                              maxWidth: "75%",
                              overflow: "auto",
                            }}
                          >
                            {meeting.isPrivate && (
                              <LockIcon
                                sx={{
                                  fontSize: 25,
                                  color: "#6b7280",
                                  flexShrink: 0,
                                  pr: 1,
                                }}
                              />
                            )}
                            {meeting.title}
                          </Typography>

                          <Typography fontSize={12} sx={{ color: "black" }}>
                            {meeting.categoryName}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                    {/* 더보기 / 접기 버튼 */}
                    {meetingsByDay.get(day) &&
                      meetingsByDay.get(day)!.length > 3 && (
                        <Typography
                          fontSize={12}
                          color="text.secondary"
                          sx={{ mt: 0.5, cursor: "pointer" }}
                          onClick={() => toggleExpand(day)}
                        >
                          {expandedDays.has(day)
                            ? "접기"
                            : `+${meetingsByDay.get(day)!.length - 3} more`}
                        </Typography>
                      )}
                  </Box>
                ) : (
                  <Typography
                    fontSize={14}
                    sx={{ color: "#9ca3af", fontStyle: "italic" }}
                  >
                    일정 없음
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* 색상 선택 팝오버 */}
      <Popover
        open={colorMenu !== null}
        onClose={handleCloseColorMenu}
        anchorEl={colorMenu?.anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        PaperProps={{
          sx: {
            p: 1.5,
            borderRadius: 2,
            mt: 1,
          },
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ mb: 1, fontWeight: 600, color: "#374151", textAlign: "center" }}
        >
          색상 선택
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1,
          }}
        >
          {COLOR_PALETTE.map((item) => (
            <Box
              key={item.color}
              onClick={() => handleColorSelect(item.color)}
              sx={{
                width: 50,
                height: 50,
                backgroundColor: item.color,
                borderRadius: 1,
                cursor: "pointer",
                border: "2px solid transparent",
                "&:active": {
                  border: "2px solid #000",
                  transform: "scale(0.95)",
                },
                transition: "all 0.2s",
              }}
              title={item.name}
            />
          ))}
        </Box>
      </Popover>
    </Box>
  );
}