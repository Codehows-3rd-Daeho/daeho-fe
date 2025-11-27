import { type GridColDef, type GridRenderCellParams } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import type { IssueListItem } from "../type";
import { mockIssueList } from "../mock/issueListMock";
import { ListDataGrid } from "../../common/List/ListDataGrid";
import { CommonPagination } from "../../common/Pagination/Pagination";
import { useNavigate } from "react-router-dom";

import { PageHeader } from "../../common/PageHeader/PageHeader";
import { Toggle } from "../../common/PageHeader/Toggle/Toggle";
import { AddButton } from "../../common/PageHeader/AddButton/Addbutton";
import { Box, Typography } from "@mui/material";

export function IssueList() {
  const navigate = useNavigate();

  const [issues, setIssues] = useState<IssueListItem[]>(
    mockIssueList.map((item) => ({ ...item, isDel: false }))
  );

  // 페이징
  const [page, setPage] = useState(1);
  const [data, setData] = useState<[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetch(`/api/issues?page=${page}&size=10`)
      .then((res) => res.json())
      .then((data) => {
        setData(data.content); // 데이터
        setTotalCount(data.totalElements); // 전체 개수
      });
  }, [page]);

  // 리스트 컬럼
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
      flex: 2,
      minWidth: 300,
      headerAlign: "center",
      align: "left",
    },
    {
      field: "status",
      headerName: "상태",
      flex: 2,
      minWidth: 80,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "period",
      headerName: "기간",
      flex: 1.2,
      minWidth: 160,
      headerAlign: "center",
      align: "center",
      renderCell: (params: GridRenderCellParams<IssueListItem>) => {
        const row = params.row;
        const start = new Date(row.startDate);
        const end = new Date(row.endDate);
        const format = (d: Date) =>
          `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
            2,
            "0"
          )}-${String(d.getDate()).padStart(2, "0")}`;
        return `${format(start)} ~ ${format(end)}`;
      },
    },
    {
      field: "department",
      headerName: "부서",
      flex: 1,
      minWidth: 120,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "category",
      headerName: "주제",
      flex: 1,
      minWidth: 120,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "isHost",
      headerName: "주관자",
      flex: 1,
      minWidth: 120,
      headerAlign: "center",
      align: "center",
    },
  ];

  const deleteIssue = (id: number) => {
    setIssues((prev) =>
      prev.map((issue) => (issue.id === id ? { ...issue, isDel: true } : issue))
    );
  };

  return (
    <>
      {/* 타이틀 */}
      <Box mb={2}>
        {" "}
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
      <PageHeader>
        <Toggle
          options={[
            { label: "리스트", value: "list", path: "/issue/list" },
            { label: "칸반", value: "kanban", path: "/issue/kanban" },
          ]}
        />

        <AddButton onClick={() => navigate("/issue/create")} />
      </PageHeader>

      <ListDataGrid<IssueListItem>
        rows={issues}
        columns={allColumns}
        rowIdField="id"
        onRowDelete={(row) => deleteIssue(row.id)}
      />

      <CommonPagination
        page={page}
        totalCount={totalCount}
        onPageChange={setPage}
      />
    </>
  );
}
