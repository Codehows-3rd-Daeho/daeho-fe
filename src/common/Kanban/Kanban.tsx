import React from "react";
import { Box, Card, CardContent, Typography, Chip, Stack } from "@mui/material";

// 예시 데이터
const issues = [
  {
    id: 1,
    title: "이슈 1",
    status: "진행중",
    category: "연구개발",
    team: ["팀명 1", "팀명 2"],
    period: "25.10.01 ~ 25.10.30",
    owner: "주관자 이름",
    deadline: -1,
  },
  {
    id: 2,
    title: "이슈 2",
    status: "진행중",
    category: "영업/고객",
    team: ["팀명 1", "팀명 2"],
    period: "25.10.01 ~ 25.10.30",
    owner: "주관자 이름",
    deadline: -25,
  },
  {
    id: 3,
    title: "이슈 3",
    status: "진행완료",
    category: "카테고리",
    team: ["팀명 1", "팀명 2"],
    period: "25.10.01 ~ 25.10.30",
    owner: "주관자 이름",
    deadline: 0,
  },
  {
    id: 4,
    title: "이슈 4",
    status: "미결(기한초과)",
    category: "카테고리",
    team: ["팀명 1", "팀명 2"],
    period: "25.10.01 ~ 25.10.30",
    owner: "주관자 이름",
    deadline: 1,
  },
];

const statusColumns = ["진행중", "진행완료", "미결(기한초과)"];

const getDeadlineLabel = (deadline: number) => {
  if (deadline < 0) return `D${deadline}`;
  if (deadline > 0) return `D+${deadline}`;
  return "완료";
};

const KanbanBoard: React.FC = () => {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        padding: 2,
        overflowX: "auto", // 화면이 좁으면 가로 스크롤
        alignItems: "flex-start", // 컬럼 위쪽 정렬
      }}
    >
      {statusColumns.map((status) => (
        <Box
          key={status}
          sx={{
            minWidth: 300, // 각 컬럼 최소 너비
            flex: "0 0 auto", // 컬럼 크기 고정
          }}
        >
          <Typography variant="h6" gutterBottom>
            {status} ({issues.filter((i) => i.status === status).length})
          </Typography>
          <Stack spacing={2}>
            {issues
              .filter((issue) => issue.status === status)
              .map((issue) => (
                <Card key={issue.id} variant="outlined">
                  <CardContent>
                    <Stack direction="row" spacing={1} mb={1}>
                      <Chip
                        label={getDeadlineLabel(issue.deadline)}
                        size="small"
                        color="info"
                      />
                      <Chip label={issue.category} size="small" />
                    </Stack>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {issue.title}
                    </Typography>
                    <Stack direction="row" spacing={1} mt={1} mb={1}>
                      {issue.team.map((t) => (
                        <Chip key={t} label={t} size="small" />
                      ))}
                    </Stack>
                    <Typography variant="caption" display="block">
                      {issue.period}
                    </Typography>
                    <Typography
                      variant="caption"
                      display="block"
                      textAlign="right"
                    >
                      {issue.owner}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
          </Stack>
        </Box>
      ))}
    </Box>
  );
};

export default KanbanBoard;
