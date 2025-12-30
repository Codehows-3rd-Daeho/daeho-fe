import { useNavigate } from "react-router-dom";
import KanbanBoard from "../../common/Kanban/KanbanBoard";
import { PageHeader } from "../../common/PageHeader/PageHeader";
import { Toggle } from "../../common/PageHeader/Toggle/Toggle";
import { AddButton } from "../../common/PageHeader/AddButton/Addbutton";
import { Box, Typography } from "@mui/material";
import { useAuthStore } from "../../store/useAuthStore";
import { useEffect, useState } from "react";
import type { KanbanIssue } from "../../common/Kanban/type";
import type { IssueListItem } from "../../issue/type/type";
import { getKanbanIssuesMT } from "../../issue/api/issueApi";
import type { ApiError } from "../../config/httpClient";

export type KanbanData = Record<string, KanbanIssue[]>;

export default function MTIssueKanban() {
  const navigate = useNavigate();
  const { member } = useAuthStore();
  const [data, setData] = useState<KanbanData>({
    pending: [],
    done: [],
    delay: [],
  });

  useEffect(() => {
    getKanbanIssuesMT(member!.memberId)
      .then(
        (res: {
          inProgress: IssueListItem[];
          completed: IssueListItem[];
          delayed: IssueListItem[];
        }) => {
          const delayIds = new Set(res.delayed.map((item) => item.id));
          const filteredPending = res.inProgress.filter(
            (item) => !delayIds.has(item.id)
          );

          setData({
            pending: filteredPending,
            done: res.completed,
            delay: res.delayed,
          });
        }
      )
      .catch((error) => {
        const apiError = error as ApiError;
        const response = apiError.response?.data?.message;
        alert(response ?? "오류가 발생했습니다.");
      });
  }, []);

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
          minWidth={100}
        >
          이슈
        </Typography>
      </Box>
      {/* 헤더 */}
      <PageHeader>
        <Toggle
          options={[
            { label: "리스트", value: "list", path: "/mytask/issue/list" },
            { label: "칸반", value: "kanban", path: "/mytask/issue/kanban" },
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
