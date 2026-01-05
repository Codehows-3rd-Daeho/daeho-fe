import type { useNavigate } from "react-router-dom";
import type { MeetingListItem } from "../type/type";
import { Box, Typography, IconButton } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { PageHeader } from "../../common/PageHeader/PageHeader";
import { AddButton } from "../../common/PageHeader/AddButton/Addbutton";

interface MobileScheduleProps {
  year: number;
  month: number;
  monthDays: Date[];
  meetingsByDay: Map<number, MeetingListItem[]>;
  isTodayDate: (date: Date) => boolean;
  getDayColor: (date: Date) => string;
  formatDate: (date: Date) => string;
  setCurrent: React.Dispatch<React.SetStateAction<Date>>;
  navigate: ReturnType<typeof useNavigate>;
}
export default function MobileMeetingSchedule({
  year,
  month,
  monthDays,
  meetingsByDay,
  isTodayDate,
  getDayColor,
  formatDate,
  setCurrent,
  navigate,
}: MobileScheduleProps) {
  return (
    // 리스트 뷰 (세로형)
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

          return (
            <Box
              key={index}
              sx={{
                backgroundColor: "#fff",
                borderRadius: 2,
                p: 2,
                border: today ? "2px solid #2563eb" : "1px solid #e5e7eb",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: dayMeetings.length > 0 ? 1 : 0,
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

              {dayMeetings.length > 0 ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {dayMeetings.map((meeting) => (
                    <Box
                      key={meeting.id}
                      sx={{
                        boxSizing: "border-box",
                        px: 1,
                        py: 1,
                        cursor: "pointer",
                        backgroundColor: "#4b6485",
                        borderRadius: 1,
                        "&:hover": {
                          backgroundColor: "#1a3260",
                        },
                      }}
                      onClick={() => navigate(`/meeting/${meeting.id}`)}
                    >
                      {/* 일시 , 카테고리 */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between", // 좌우로 벌리기
                          gridTemplateColumns: "auto 1fr",
                          gap: 1,
                          mb: 1,
                          width: "100%",
                        }}
                      >
                        <Box sx={{ fontSize: 12, color: "white" }}>
                          {meeting.startDate?.split(" ")[1]}
                        </Box>

                        <Typography fontSize={12} sx={{ color: "white" }}>
                          {meeting.categoryName}
                        </Typography>
                      </Box>
                      <Typography fontSize={14} sx={{ color: "white" }}>
                        {meeting.title}
                      </Typography>
                    </Box>
                  ))}
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
          );
        })}
      </Box>
    </Box>
  );
}
