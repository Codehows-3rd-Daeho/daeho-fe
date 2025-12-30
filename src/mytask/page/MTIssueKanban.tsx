import { useNavigate } from "react-router-dom";
import KanbanBoard from "../../common/Kanban/KanbanBoard";
import { PageHeader } from "../../common/PageHeader/PageHeader";
import { Toggle } from "../../common/PageHeader/Toggle/Toggle";
import { AddButton } from "../../common/PageHeader/AddButton/Addbutton";
import { Box, Typography } from "@mui/material";
import { useAuthStore } from "../../store/useAuthStore";
import { useEffect, useState } from "react";
import type { KanbanIssue } from "../../common/Kanban/type";
import type { IssueFilter, IssueListItem } from "../../issue/type/type";
import { getKanbanIssuesMT } from "../../issue/api/issueApi";
import { SearchBar } from "../../common/SearchBar/SearchBar";
import DateFilter from "../../common/PageHeader/DateFilter";
import Filter from "../../common/PageHeader/Filter";

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

  const [filter, setFilter] = useState<IssueFilter>({
    keyword: "",
    departmentIds: [],
    categoryIds: [],
    hostIds: [],
    participantIds: [],
    statuses: [],
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (!member?.memberId) return;

    const fetchIssues = async () => {
      try {
        const res: {
          inProgress: IssueListItem[];
          completed: IssueListItem[];
          delayed: IssueListItem[];
        } = await getKanbanIssuesMT(member.memberId, filter);

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
      }
    };

    fetchIssues();
  }, [filter, member?.memberId]);

  // 검색바 전용 핸들러
  const handleSearch = (query: string) => {
    setFilter((prev) => ({ ...prev, keyword: query }));
  };

  // 필터 전용 핸들러
  const handleFilterChange = (newFilter: IssueFilter) => {
    setFilter(newFilter);
  };

  return (
    <>
      {/* 타이틀 */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-end"
        mb={3}
      >
        <Typography variant="h4" component="h1" fontWeight="bold">
          이슈
        </Typography>
        {role === "USER" && (
          <AddButton onClick={() => navigate("/issue/create")} />
        )}
      </Box>

      {/* 헤더 */}
      <PageHeader>
        <Box sx={{ alignSelf: "center" }}>
          <Toggle
            options={[
              { label: "리스트", value: "list", path: "/mytask/issue/list" },
              { label: "칸반", value: "kanban", path: "/mytask/issue/kanban" },
            ]}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DateFilter
            startDate={filter.startDate ?? ""}
            endDate={filter.endDate ?? ""}
            onStartDateChange={(v) =>
              setFilter((prev) => ({ ...prev, startDate: v }))
            }
            onEndDateChange={(v) =>
              setFilter((prev) => ({ ...prev, endDate: v }))
            }
          />
          <Filter
            value={filter}
            onChange={handleFilterChange}
            excludeSections={["상태"]}
          />
          <SearchBar onSearch={handleSearch} placeholder="검색" />
        </Box>
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
