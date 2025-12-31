import { useNavigate } from "react-router-dom";
import KanbanBoard from "../../common/Kanban/KanbanBoard";
import { PageHeader } from "../../common/PageHeader/PageHeader";
import { Toggle } from "../../common/PageHeader/Toggle/Toggle";
import { AddButton } from "../../common/PageHeader/AddButton/Addbutton";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { getKanbanIssuesSrc } from "../api/issueApi";
import type { IssueListItem } from "../type/type";
import type { KanbanIssue } from "../../common/Kanban/type";
import { SearchBar } from "../../common/SearchBar/SearchBar";
import Filter from "../../common/PageHeader/Filter";
import DateFilter from "../../common/PageHeader/DateFilter";
import type { FilterDto } from "../../common/PageHeader/type";

export type KanbanData = Record<string, KanbanIssue[]>;

export default function IssueKanban() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [data, setData] = useState<KanbanData>({
    pending: [],
    done: [],
    delay: [],
  });

  const [filter, setFilter] = useState<FilterDto>({
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
    const fetchIssues = async () => {
      try {
        setIsLoading(true);
        const res: {
          inProgress: IssueListItem[];
          completed: IssueListItem[];
          delayed: IssueListItem[];
        } = await getKanbanIssuesSrc(filter);

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
  }, [filter]);

  // 검색바 전용 핸들러
  const handleSearch = (query: string) => {
    setFilter((prev) => ({ ...prev, keyword: query }));
  };

  // 필터 컴포넌트 전용 핸들러
  const handleFilterChange = (newFilter: FilterDto) => {
    setFilter(newFilter);
  };

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
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-end"
        mb={3}
      >
        <Typography
          variant="h4"
          component="h1"
          textAlign="left"
          fontWeight="bold"
        >
          이슈
        </Typography>
        <AddButton onClick={() => navigate("/issue/create")} />
      </Box>
      {/* 헤더 */}
      <PageHeader>
        <Box sx={{ alignSelf: "center" }}>
          <Toggle
            options={[
              { label: "리스트", value: "list", path: "/issue/list" },
              { label: "칸반", value: "kanban", path: "/issue/kanban" },
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
