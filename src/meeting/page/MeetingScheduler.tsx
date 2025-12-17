import { useMemo, useState } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

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

      {/* Week header */}
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

      {/* Calendar grid */}
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
                {day && (
                  <Typography
                    fontSize={13}
                    fontWeight={isToday(day) ? 700 : 500}
                    color={isToday(day) ? "primary.main" : "#374151"}
                  >
                    {day}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
