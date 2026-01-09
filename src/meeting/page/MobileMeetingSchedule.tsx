import type { useNavigate } from "react-router-dom";
import type { MeetingListItem } from "../type/type";
import { Box, Typography, IconButton } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { PageHeader } from "../../common/PageHeader/PageHeader";
import { AddButton } from "../../common/PageHeader/AddButton/Addbutton";
import LockIcon from "@mui/icons-material/Lock";

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
                          borderLeft: "4px solid #4b6485", // 앞부분
                          boxShadow: "0 1px 4px rgba(0, 0, 0, 0.06)",
                          color: "#fff",
                          cursor: "pointer",
                        }}
                        onClick={() => navigate(`/meeting/${meeting.id}`)}
                      >
                        {/* 회의 card*/}
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
                                  color: "#6b7280", // 회색 톤
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
    </Box>
  );
}
