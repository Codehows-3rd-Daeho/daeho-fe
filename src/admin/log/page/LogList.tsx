import { useEffect, useState } from "react";
import type { LogList } from "../type/type";
import type { GridColDef, GridValueGetter } from "@mui/x-data-grid";
import { ListDataGrid } from "../../../common/List/ListDataGrid";
import { CommonPagination } from "../../../common/Pagination/Pagination";
import { getLogList } from "../api/LogApi";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../../common/PageHeader/PageHeader";
import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material"; // Toggle 직접 사용
import { SearchBar } from "../../../common/SearchBar/SearchBar";

export default function LogList() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [rows, setRows] = useState<LogList[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // 1. 현재 필터 상태 (ALL, ISSUE, MEETING)
  const [currentFilter, setCurrentFilter] = useState("ALL");

  const navigate = useNavigate();

  useEffect(() => {
    getLogList(page - 1, pageSize).then((data) => {
      const list = (data.content ?? data).map(
        (item: LogList, index: number) => ({
          ...item,
          no: data.totalElements - ((page - 1) * pageSize + index),
        })
      );
      setRows(list);
      setTotalCount(data.totalElements);
    });
  }, [page, pageSize]);

  const changeTypeMap: Record<string, string> = {
    CREATE: "생성",
    UPDATE: "수정",
    DELETE: "삭제",
  };

  const targetTypeMap: Record<string, string> = {
    ISSUE: "이슈",
    MEETING: "회의",
    MEMBER: "멤버",
    COMMENT: "댓글",
  };

  // 2. 필터링 로직 (토글 + 검색어 통합)
  const filteredData = rows.filter((item) => {
    const query = searchQuery.toLowerCase();

    // (A) 토글 필터링: 전체가 아니면 targetType 비교
    const matchType =
      currentFilter === "ALL" || item.targetType === currentFilter;

    // (B) 검색어 필터링
    const matchQuery =
      !query ||
      item.title?.toLowerCase().includes(query) ||
      item.memberName?.toLowerCase().includes(query) ||
      item.message?.toLowerCase().includes(query);

    return matchType && matchQuery;
  });

  const allColumns: GridColDef[] = [
    {
      field: "no",
      headerName: "No",
      flex: 0.5,
      minWidth: 50,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "targetType",
      headerName: "유형",
      flex: 1,
      minWidth: 100,
      headerAlign: "center",
      align: "center",
      valueGetter: (value) => targetTypeMap[value as string] ?? value,
    },
    {
      field: "title",
      headerName: "제목",
      flex: 2,
      minWidth: 200,
      headerAlign: "center",
      align: "left",
      renderCell: (params) => {
        const { targetId, targetType, title } = params.row;
        const handleLink = () => {
          if (!targetId) return;
          const path =
            targetType === "MEETING"
              ? `/meeting/${targetId}`
              : `/issue/${targetId}`;
          navigate(path);
        };
        return (
          <div
            onClick={handleLink}
            style={{
              cursor: "pointer",
            }}
          >
            {title || "제목 없음"}
          </div>
        );
      },
    },
    {
      field: "work",
      headerName: "작업",
      flex: 1,
      minWidth: 120,
      headerAlign: "center",
      align: "center",
      valueGetter: ((_, row) => {
        const type = changeTypeMap[row.changeType] ?? row.changeType;
        return row.updateField ? `${row.updateField} ${type}` : type;
      }) as GridValueGetter,
    },
    {
      field: "message",
      headerName: "내용",
      flex: 2,
      minWidth: 200,
      headerAlign: "center",
      align: "left",
      renderCell: (params) => (
        <div
          title={params.value}
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {params.value}
        </div>
      ),
    },
    {
      field: "memberName",
      headerName: "사용자",
      flex: 1,
      minWidth: 100,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "createTime",
      headerName: "시간",
      flex: 1.2,
      minWidth: 150,
      align: "center",
      headerAlign: "center",
    },
  ];

  return (
    <>
      <PageHeader>
        {/* 3. 로그 전용 토글 버튼 그룹 */}
        <ToggleButtonGroup
          value={currentFilter}
          exclusive
          onChange={(_, newValue) => newValue && setCurrentFilter(newValue)}
          size="small"
          sx={{
            backgroundColor: "#f1f5f9",
            borderRadius: "12px",
            p: 0.5,
            "& .MuiToggleButton-root": {
              border: "none",
              borderRadius: "8px !important",
              px: 4,
              py: 1,
              fontWeight: 600,
              color: "#64748b",
              "&.Mui-selected": {
                backgroundColor: "white",
                color: "#1e293b",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              },
            },
          }}
        >
          <ToggleButton value="ALL">전체</ToggleButton>
          <ToggleButton value="ISSUE">이슈</ToggleButton>
          <ToggleButton value="MEETING">회의</ToggleButton>
        </ToggleButtonGroup>

        <Box display="flex" alignItems="center" gap={1.5}>
          <SearchBar onSearch={setSearchQuery} placeholder="검색" />
        </Box>
      </PageHeader>

      <ListDataGrid<LogList>
        rows={filteredData}
        columns={allColumns}
        rowIdField="id"
      />

      <CommonPagination
        page={page}
        totalCount={totalCount}
        onPageChange={setPage}
      />
    </>
  );
}
