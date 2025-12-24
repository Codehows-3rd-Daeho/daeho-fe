import { useNavigate } from "react-router-dom";
import KanbanBoard from "../../common/Kanban/KanbanBoard";
import { PageHeader } from "../../common/PageHeader/PageHeader";
import { Toggle } from "../../common/PageHeader/Toggle/Toggle";
import { AddButton } from "../../common/PageHeader/AddButton/Addbutton";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { getKanbanIssues } from "../api/issueApi";
import type { IssueListItem } from "../type/type";
import type { KanbanIssue } from "../../common/Kanban/type";

export type KanbanData = Record<string, KanbanIssue[]>;

export default function IssueKanban() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [data, setData] = useState<KanbanData>({
    pending: [],
    done: [],
    delay: [],
  });

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setIsLoading(true);
        const res: {
          inProgress: IssueListItem[];
          completed: IssueListItem[];
          delayed: IssueListItem[];
        } = await getKanbanIssues();

        const delayIds = new Set(res.delayed.map((item) => item.id));
        const filteredPending = res.inProgress.filter(
          (item) => !delayIds.has(item.id)
        );

        setData({
          pending: filteredPending,
          done: res.completed,
          delay: res.delayed,
        });
      } catch (error) {
        console.error("칸반 이슈 조회 실패", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIssues();
  }, []);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
          width: "100%",
          minWidth: "1000px",
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <>
      {/* 타이틀 */}
      <Box mb={2}>
        {/* 아래 여백 */}
        <Typography
          variant="h4" // 글자 크기
          component="h1"
          textAlign="left" // 왼쪽 정렬
          fontWeight="bold" // 볼드
        >
          이슈
        </Typography>
      </Box>
      {/* 헤더 */}
      <PageHeader>
        <Toggle
          options={[
            { label: "리스트", value: "list", path: "/issue/list" },
            { label: "칸반", value: "kanban", path: "/issue/kanban" },
          ]}
        />

        <AddButton onClick={() => navigate("/issue/create")} />
      </PageHeader>

      {/* 칸반 */}
      <KanbanBoard
        columns={[
          { key: "pending", title: "진행중" },
          { key: "done", title: "진행완료" },
          { key: "delay", title: "미결(기한초과)" },
        ]}
        issues={data}
        onClickIssue={(issue) => navigate(`/issue/${issue.id}`)}
      />
    </>
  );
}
