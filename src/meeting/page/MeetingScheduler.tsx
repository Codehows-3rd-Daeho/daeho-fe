import { useEffect, useMemo, useState } from "react";
import { Box, Typography, IconButton, Card } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { getMeetingMonth } from "../api/MeetingApi";
import type { MeetingListItem } from "../type/type";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../common/PageHeader/PageHeader";
import { AddButton } from "../../common/PageHeader/AddButton/Addbutton";

const days = ["일", "월", "화", "수", "목", "금", "토"];

function getMonthMatrix(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  const matrix: (number | null)[][] = [];
  let week: (number | null)[] = Array(firstDay).fill(null);

  for (let d = 1; d <= lastDate; d++) {
    week.push(d);
    if (week.length === 7) {
      matrix.push(week);
      week = [];
    }
  }

  if (week.length) {
    matrix.push([...week, ...Array(7 - week.length).fill(null)]);
  }

  return matrix;
}

export default function MeetingScheduler() {
  const navigate = useNavigate();

  const today = new Date();
  const [current, setCurrent] = useState(new Date());

  const year = current.getFullYear();
  const month = current.getMonth();

  const matrix = useMemo(() => getMonthMatrix(year, month), [year, month]);

  const isToday = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  //회의 조회용
  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);

  //달이 바뀔 때마다 데이터 조회
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await getMeetingMonth(year, month + 1);
        setMeetings(response);
      } catch (error) {
        console.error("회의 데이터 로딩 실패:", error);
      }
    };

    fetchMeetings();
  }, [year, month]); // year나 month가 바뀌면 실행

  //날짜별로 회의 묶음
  const meetingsByDay = useMemo(() => {
    const map = new Map<number, MeetingListItem[]>();

    meetings.forEach((meeting) => {
      // "2024-12-25" 형태의 문자열에서 연, 월, 일을 직접 추출 (안전함)
      const [datePart] = meeting.startDate.split(" "); // "2024-12-25"
      const [mYear, mMonth, mDay] = datePart.split("-").map(Number);

      // 서버에서 가져온 데이터 중, 현재 달력의 연/월과 일치하는 것만 매핑
      // mMonth - 1 은 JS Date 객체의 month(0~11) 기준과 맞추기 위함
      if (mYear === year && mMonth - 1 === month) {
        if (!map.has(mDay)) {
          map.set(mDay, []);
        }
        map.get(mDay)!.push(meeting);
      }
    });

    return map;
  }, [meetings, year, month]); // year와 month가 바뀔 때마다 다시 계산됨

  //더보기시 확장
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());

  const toggleExpand = (day: number) => {
    setExpandedDays((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(day)) newSet.delete(day); // 이미 확장되었으면 접기
      else newSet.add(day); // 확장
      return newSet;
    });
  };

  return (
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
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mb: 3,
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
        <Box />
        <AddButton onClick={() => navigate("/meeting/create")} />
      </PageHeader>

      {/* 요일 표시 */}
      <Box
        sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", mb: 1 }}
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
                              : `+${meetingsByDay.get(day)!.length - 3} more`}
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
  );
}
