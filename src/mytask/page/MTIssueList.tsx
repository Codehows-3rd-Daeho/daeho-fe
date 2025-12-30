import { type GridColDef, type GridRenderCellParams } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { ListDataGrid } from "../../common/List/ListDataGrid";
import { CommonPagination } from "../../common/Pagination/Pagination";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../common/PageHeader/PageHeader";
import { Toggle } from "../../common/PageHeader/Toggle/Toggle";
import { AddButton } from "../../common/PageHeader/AddButton/Addbutton";
import { Box, Typography } from "@mui/material";
import { useAuthStore } from "../../store/useAuthStore";
import { getStatusLabel } from "../../common/commonFunction";
import { getIssueListMT } from "../../issue/api/issueApi";
import type { IssueListItem } from "../../issue/type/type";
import type { ApiError } from "../../config/httpClient";

export default function MTIssueList() {
  const navigate = useNavigate();
  const { member } = useAuthStore();

  // 페이징
  const [page, setPage] = useState(1);
  const [data, setData] = useState<IssueListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  // 데이터 가져오기
  useEffect(() => {
    getIssueListMT(member!.memberId, page - 1, 10)
      .then((data) => {
        const list = (data.content ?? data).map((item: IssueListItem) => ({
          ...item,
          status: getStatusLabel(item.status),
        }));

        setData(list);
        setTotalCount(data.totalElements); // 전체 개수
      })
      .catch((error) => {
        const apiError = error as ApiError;
        const response = apiError.response?.data?.message;
        alert(response ?? "오류가 발생했습니다.");
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
      minWidth: 600,
      headerAlign: "center",
      align: "left",
      renderCell: (params) => (
        <div
          style={{ width: "100%", cursor: "pointer" }}
          onClick={() => navigate(`/issue/${params.id}`)}
        >
          {params.value}
        </div>
      ),
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
      minWidth: 250,
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
      field: "departmentName",
      headerName: "부서",
      flex: 1,
      minWidth: 200,

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
      minWidth: 100,
      maxWidth: 120,
      headerAlign: "center",
      align: "center",
    },
  ];

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
      <PageHeader>
        <Toggle
          options={[
            { label: "리스트", value: "list", path: "/mytask/issue/list" },
            { label: "칸반", value: "kanban", path: "/mytask/issue/kanban" },
          ]}
        />

        <AddButton onClick={() => navigate("/issue/create")} />
      </PageHeader>

      <ListDataGrid<IssueListItem>
        rows={data}
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
