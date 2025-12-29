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
import { SearchBar } from "../../common/SearchBar/SearchBar";

export type KanbanData = Record<string, KanbanIssue[]>;

export default function MTIssueKanban() {
  const navigate = useNavigate();
  const { member } = useAuthStore();
  const role = member?.role;
  const [data, setData] = useState<KanbanData>({
    pending: [],
    done: [],
    delay: [],
  });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getKanbanIssuesMT(member!.memberId, searchQuery).then(
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
    );
  }, [searchQuery]);

  return (
    <>
      {/* 타이틀 */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-end"
        mb={3}
      >
        {/* 아래 여백 */}
        <Typography
          variant="h4" // 글자 크기
          component="h1"
          textAlign="left" // 왼쪽 정렬
          fontWeight="bold" // 볼드
        >
          이슈
        </Typography>
        {role === "USER" && (
          <AddButton onClick={() => navigate("/issue/create")} />
        )}
      </Box>
      {/* 헤더 */}
      <PageHeader>
        <Toggle
          options={[
            { label: "리스트", value: "list", path: "/mytask/issue/list" },
            { label: "칸반", value: "kanban", path: "/mytask/issue/kanban" },
          ]}
        />
        <SearchBar onSearch={setSearchQuery} placeholder="검색" />
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
