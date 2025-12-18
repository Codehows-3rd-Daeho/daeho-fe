import { useEffect, useMemo, useState } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { getMeetingMonth } from "../api/MeetingApi";
import type { MeetingListItem } from "../type/type";

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
  const today = new Date();
  const [current, setCurrent] = useState(new Date());

  const year = current.getFullYear();
  const month = current.getMonth();

  const matrix = useMemo(() => getMonthMatrix(year, month), [year, month]);

  const isToday = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);

  //달이 바뀔 때마다 데이터 조회
  useEffect(() => {
    const fetchMeetings = async () => {
      const response = await getMeetingMonth(year, month + 1);
      setMeetings(response);
    };

    fetchMeetings();
  }, [year, month]);

  //날짜별로 회의 묶음
  const meetingsByDay = useMemo(() => {
    //useMemo: 메모리에 저장되어있는 계산된 값을 가져와 재사용
    const map = new Map<number, MeetingListItem[]>(); // 1 -> [회의1, 회의2, 회의4], 6 -> [...]

    //서버에서 받아온 응답(meetings)을 순회
    meetings.forEach((meeting) => {
      // JavaScript가 지원하는 날짜 문자열 형식으로 변경
      const date = new Date(meeting.startDate.replace(" ", "T")); //시작일 추출 2025-12-25T12:00
      if (isNaN(date.getTime())) return;
      const day = date.getDate(); //일자만 추출 25

      //시작일 없으면 빈배열 추가
      if (!map.has(day)) {
        map.set(day, []);
      }
      //해당 날짜에 배열 넣고 회의 추가
      map.get(day)!.push(meeting);
    });

    return map;
  }, [meetings]);

  return (
    <Box sx={{ p: 3, backgroundColor: "#fff", borderRadius: 3 }}>
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
        <Typography fontWeight={600}>
          {year}년 {month + 1}월
        </Typography>
        <IconButton onClick={() => setCurrent(new Date(year, month + 1, 1))}>
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {/* 요일 표시 */}
      <Box
        sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", mb: 1 }}
      >
        {days.map((d) => (
          <Typography
            key={d}
            align="center"
            fontSize={14}
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
          gridTemplateRows: `repeat(${matrix.length}, 1fr)`,
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
                  height: 110,
                  borderRadius: 2,
                  border: "1px solid #eef2f7",
                  p: 1,
                  position: "relative",
                  backgroundColor: day && isToday(day) ? "#f0f6ff" : "#fff",
                }}
              >
                {/* {day && (
                  <Typography
                    fontSize={13}
                    fontWeight={isToday(day) ? 700 : 500}
                    color={isToday(day) ? "primary.main" : "#374151"}
                  >
                    {day}
                  </Typography>
                )} */}
                {day && (
                  <>
                    <Typography
                      fontSize={13}
                      fontWeight={isToday(day) ? 700 : 500}
                      color={isToday(day) ? "primary.main" : "#374151"}
                    >
                      {day}
                    </Typography>

                    <Box sx={{ mt: 0.5 }}>
                      {meetingsByDay.get(day)?.map((meeting) => (
                        <Typography
                          key={meeting.id}
                          fontSize={11}
                          sx={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            color: "#2563eb",
                          }}
                        >
                          • {meeting.title}
                        </Typography>
                      ))}
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
