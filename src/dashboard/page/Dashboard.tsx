import { Box, Button, Card, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { getKanbanIssues } from "../../issue/api/issueApi";
import type { KanbanData } from "../../mytask/page/MTIssueKanban";
import KanbanBoard from "../../common/Kanban/KanbanBoard";
import { useNavigate } from "react-router-dom";
import {
  getMeetingListMT,
  getMeetingMonthMT,
} from "../../meeting/api/MeetingApi";
import { getStatusLabel } from "../../common/commonFunction";
import type { MeetingListItem } from "../../meeting/type/type";
import { ListDataGrid } from "../../common/List/ListDataGrid";
import { useAuthStore } from "../../store/useAuthStore";
import type { GridColDef } from "@mui/x-data-grid";
import type { ApiError } from "../../config/httpClient";
import { useTheme, useMediaQuery } from "@mui/material";

const days = ["일", "월", "화", "수", "목", "금", "토"];

export default function Dashboard() {
  const [issueData, setIssueData] = useState<KanbanData>({
    pending: [],
    done: [],
    delay: [],
  });
  //회의
  const [meetingData, setMeetingData] = useState<MeetingListItem[]>([]);
  //캘린더 회의 조회용
  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);

  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const allColumns: GridColDef[] = [
    {
      field: "id",
      headerName: "No",
      flex: 0.5,
      minWidth: 60,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "title",
      headerName: "제목",
      flex: isMobile ? 1 : 2,
      minWidth: isMobile ? 300 : 600, 
      headerAlign: "center",
      align: "left",
      renderCell: (params) => (
        <div
          style={{ 
            width: "100%", 
            cursor: "pointer",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap" 
          }}
          onClick={() => navigate(`/meeting/${params.id}`)}
        >
          {params.value}
        </div>
      ),
    },
    {
      field: "status",
      headerName: "상태",
      flex: 0.5,
      minWidth: 80,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "startDate",
      headerName: "일시",
      flex: 1.2,
      minWidth: 190,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "departmentName",
      headerName: "부서",
      flex: 1,
      minWidth: 120,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => params.row.departmentName.join(", "),
    },
    {
      field: "categoryName",
      headerName: "카테고리",
      flex: 1,
      minWidth: 120,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "hostName",
      headerName: "주관자",
      flex: 1,
      minWidth: 120,
      headerAlign: "center",
      align: "center",
    },
  ];
  const displayColumns = useMemo(() => {
  if (isMobile) {
    return allColumns.filter((col) => col.field === "title");
  }
  return allColumns;
}, [isMobile, allColumns]);

  //회의 캘린더====================================================================================

  const { member } = useAuthStore();
  const navigate = useNavigate();

  //오늘
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0~11

  // 주간 범위 계산
  const [startOfWeek, endOfWeek, weekDays] = useMemo(() => {
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay());

    const end = new Date(today);
    end.setDate(today.getDate() + (6 - today.getDay()));

    const daysArray: Date[] = [];
    const d = new Date(start);
    while (d <= end) {
      daysArray.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }

    return [start, end, daysArray] as const;
  }, [today]);

  //주 단위 배열
  const matrix = [weekDays]; // 2차원 배열로, 한 주만 있음

  //오늘 날짜 확인
  const isToday = (date: Date) =>
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  //날짜별로 회의 묶음
  const meetingsByDay = useMemo(() => {
    const map = new Map<number, MeetingListItem[]>();
    weekDays.forEach((d) => map.set(d.getDate(), []));
    meetings.forEach((m) => {
      const mDate = new Date(m.startDate.replace(" ", "T"));
      if (map.has(mDate.getDate())) map.get(mDate.getDate())!.push(m);
    });
    return map;
  }, [meetings, weekDays]);

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

  useEffect(() => {
    if (!member) return;

    const fetchData = async () => {
      try {
        // 1. 이슈 데이터==============================================================
        const issueRes = await getKanbanIssues();
        const delayIds = new Set(issueRes.delayed.map((item) => item.id));
        const filteredPending = issueRes.inProgress.filter(
          (item) => !delayIds.has(item.id)
        );

        setIssueData({
          pending: filteredPending.slice(0, 1),
          done: issueRes.completed.slice(0, 1),
          delay: issueRes.delayed.slice(0, 1),
        });

        // 2. 회의 리스트============================================================
        const meetingList = await getMeetingListMT(member.memberId, 0, 3);
        const list = (meetingList.content ?? meetingList).map(
          (item: MeetingListItem) => ({
            ...item,
            status: getStatusLabel(item.status),
          })
        );
        setMeetingData(list);

        // 3. 회의 캘린더===========================================================
        const startMonth = startOfWeek.getMonth() + 1;
        const endMonth = endOfWeek.getMonth() + 1;
        const startYear = startOfWeek.getFullYear();
        const endYear = endOfWeek.getFullYear();

        let calendarMeetings: MeetingListItem[] = [];
        if (startMonth === endMonth && startYear === endYear) {
          calendarMeetings = await getMeetingMonthMT(
            member.memberId,
            startYear,
            startMonth
          );
        } else {
          const res1 = await getMeetingMonthMT(
            member.memberId,
            startYear,
            startMonth
          );
          const res2 = await getMeetingMonthMT(
            member.memberId,
            endYear,
            endMonth
          );
          calendarMeetings = [...res1, ...res2];
        }
        setMeetings(calendarMeetings);
      } catch (error) {
        const apiError = error as ApiError;
        const message =
          apiError.response?.data?.message ??
          `대시보드 데이터 조회 중 오류가 발생했습니다.\n잠시후 다시 시도해주세요.`;
        alert(message);
      }
    };

    fetchData();
  }, [member]);

  return (
    <Box
      sx={{
        // minWidth: 1000, // ✅ 전체 최소 너비
        mx: "auto", // 가운데 정렬
        px: 2, // 양쪽 여백
      }}
    >
      {/* 나의 이슈 목록(칸반) */}
      {/* 헤더 */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          minWidth: 300,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          나의 이슈 목록
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate("/mytask/issue/kanban")}
        >
          나의 이슈 목록
        </Button>
      </Box>
      <KanbanBoard
        columns={[
          { key: "pending", title: "진행중" },
          { key: "done", title: "진행완료" },
          { key: "delay", title: "미결(기한초과)" },
        ]}
        issues={issueData}
        onClickIssue={(issue) => navigate(`/issue/${issue.id}`)}
      />

      {/* 나의 예정 회의 리스트 */}
      {/* 헤더 */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          minWidth: 300,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          나의 회의 목록
        </Typography>
        <Button variant="outlined" onClick={() => navigate("/mytask/meeting")}>
          나의 회의
        </Button>
      </Box>
      <ListDataGrid<MeetingListItem>
        rows={meetingData}
        columns={displayColumns}
        rowIdField="id"
      />

      {/* 나의 회의 일정 */}
      {/* 헤더 */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 1.5,
          py: 1,
          minWidth: 300,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          나의 회의 일정표
        </Typography>

        <Button
          variant="outlined"
          sx={{ alignSelf: { xs: "flex-end", sm: "auto" } }}
          onClick={() => navigate("/mytask/schedule")}
        >
          나의 회의 일정표
        </Button>
      </Box>

      <Box
        sx={{
          backgroundColor: "#fff",
          borderRadius: 3,
          mx: "auto", // 가운데 정렬
        }}
      >
        {/* 캘린더 */}
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mb: 2,
            minWidth: 300,
          }}
        >
          <Typography fontSize={20} fontWeight={600}>
            {year}년 {month + 1}월
          </Typography>
        </Box>

        <Box sx={{ overflowX: "auto" }}>
          {/* 요일 */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              mb: 1,
              minWidth: 180 * 7,
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
              gridTemplateRows: `repeat(${matrix.length}, 1fr)`,
              gap: 1,
              minWidth: 980,
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
                          {day.getDate()}
                        </Typography>

                        <Box
                          sx={{
                            mt: 0.5,
                            display: "flex",
                            flexDirection: "column",
                            gap: 0.5,
                            minWidth: 150,
                          }}
                        >
                          {(expandedDays.has(day.getDate())
                            ? meetingsByDay.get(day.getDate())
                            : meetingsByDay.get(day.getDate())?.slice(0, 3)
                          )?.map((meeting) => (
                            <Card
                              key={meeting.id}
                              variant="outlined"
                              sx={{
                                boxSizing: "border-box",
                                px: 1,
                                py: 0.75,
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
                                  width: "100%",
                                }}
                              >
                                {meeting.startDate && (
                                  <Box sx={{ fontSize: 10, color: "white" }}>
                                    {meeting.startDate?.split(" ")[1]}
                                  </Box>
                                )}

                                <Box
                                  sx={{
                                    fontSize: 10,
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
                                  fontSize: 14,
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
                          {meetingsByDay.get(day.getDate()) &&
                            meetingsByDay.get(day.getDate())!.length > 3 && (
                              <Typography
                                fontSize={12}
                                color="text.secondary"
                                sx={{ mt: 0.5, cursor: "pointer" }}
                                onClick={() => toggleExpand(day.getDate())}
                              >
                                {expandedDays.has(day.getDate())
                                  ? "접기"
                                  : `+${
                                      meetingsByDay.get(day.getDate())!.length -
                                      3
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
    </Box>
  );
}
