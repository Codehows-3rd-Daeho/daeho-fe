import { Box, Typography, IconButton, Card } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import type { MeetingListItem } from "../type/type";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../common/PageHeader/PageHeader";
import { AddButton } from "../../common/PageHeader/AddButton/Addbutton";

interface DesktopScheduleProps {
  year: number;
  month: number;
  matrix: (number | null)[][];
  meetingsByDay: Map<number, MeetingListItem[]>;
  expandedDays: Set<number>;
  toggleExpand: (day: number) => void;
  setCurrent: React.Dispatch<React.SetStateAction<Date>>;
  navigate: ReturnType<typeof useNavigate>;
  isToday: (day: number) => boolean;
}

export default function DesktopMeetingSchedule({
  year,
  month,
  matrix,
  meetingsByDay,
  expandedDays,
  toggleExpand,
  setCurrent,
  navigate,
  isToday,
}: DesktopScheduleProps) {
  const days = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          mb: 3,
        }}
      >
        {/* 날짜 헤더 */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
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
      </Box>
      <Box
        sx={{
          width: "100%",
          overflowX: "auto",
        }}
      >
        <Box
          sx={{
            p: 3,
            backgroundColor: "#fff",
            borderRadius: 3,
            minWidth: 1500, // ✅ 최소 너비
            maxWidth: 2000, // (선택) 너무 커지지 않게
            mx: "auto", // 가운데 정렬
          }}
        >
          {/* 요일 표시 */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              mb: 1,
            }}
          >
            {days.map((d) => (
              <Typography
                key={d}
                align="center"
                fontSize={18}
                fontWeight={600}
                color="#6b7280"
              >
                {d}
              </Typography>
            ))}
          </Box>

          {/* 날짜 칸 */}
          <Box
            sx={{
              display: "grid",
              gridTemplateRows: "auto",
              gap: 1,
            }}
          >
            {matrix.map((week, wi) => (
              <Box
                key={wi}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: 1,
                }}
              >
                {week.map((day, di) => (
                  <Box
                    key={di}
                    sx={{
                      borderRadius: 2,
                      border:
                        day && isToday(day)
                          ? "3px solid #2563EB"
                          : "2px solid #eef2f7",
                      p: 1,
                      minHeight: 150,
                      position: "relative",
                      backgroundColor: "#fff",
                    }}
                  >
                    {day && (
                      <>
                        <Typography
                          fontSize={15}
                          fontWeight={isToday(day) ? 700 : 500}
                          color={isToday(day) ? "#2563EB" : "#374151"}
                        >
                          {day}
                        </Typography>

                        <Box
                          sx={{
                            mt: 0.5,
                            display: "flex",
                            flexDirection: "column",
                            gap: 0.5,
                            minWidth: 100,
                          }}
                        >
                          {(expandedDays.has(day)
                            ? meetingsByDay.get(day)
                            : meetingsByDay.get(day)?.slice(0, 3)
                          )?.map((meeting) => (
                            <Card
                              key={meeting.id}
                              variant="outlined"
                              sx={{
                                boxSizing: "border-box",
                                px: 1,
                                py: 1,
                                cursor: "pointer",
                                // border: "2px solid #bb91ff",
                                backgroundColor: "#4b6485",
                                width: 180,

                                "&:hover": {
                                  backgroundColor: "#1a3260",
                                  // borderColor: "#2563eb",
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
                                {meeting.startDate && (
                                  <Box sx={{ fontSize: 12, color: "white" }}>
                                    {meeting.startDate?.split(" ")[1]}
                                  </Box>
                                )}

                                <Box
                                  sx={{
                                    fontSize: 12,
                                    color: "white",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {meeting.categoryName}
                                </Box>
                              </Box>
                              <Box
                                sx={{
                                  fontSize: 15,
                                  fontWeight: 500,
                                  color: "white",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  width: "100%", // 카드 폭에 맞춤
                                }}
                              >
                                {meeting.title}
                              </Box>
                            </Card>
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
                                  : `+${
                                      meetingsByDay.get(day)!.length - 3
                                    } more`}
                              </Typography>
                            )}
                        </Box>
                      </>
                    )}
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </>
  );
}
