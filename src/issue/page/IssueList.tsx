import { type GridColDef, type GridRenderCellParams } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import type { IssueListItem } from "../type/type";
import { ListDataGrid } from "../../common/List/ListDataGrid";
import { CommonPagination } from "../../common/Pagination/Pagination";
import { useNavigate } from "react-router-dom";

import { PageHeader } from "../../common/PageHeader/PageHeader";
import { Toggle } from "../../common/PageHeader/Toggle/Toggle";
import { AddButton } from "../../common/PageHeader/AddButton/Addbutton";
import { Box, Typography } from "@mui/material";
import { getIssueList } from "../api/issueApi";
import { getStatusLabel } from "../../common/commonFunction";
import { SearchBar } from "../../common/SearchBar/SearchBar";
import type { ApiError } from "../../config/httpClient";

export default function IssueList() {
  const navigate = useNavigate();

  // 페이징
  const [page, setPage] = useState(1);
  const [data, setData] = useState<IssueListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  // 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getIssueList(page - 1, 10);
        const list = (data.content ?? data).map((item: IssueListItem) => ({
          ...item,
          status: getStatusLabel(item.status),
        }));

        setData(list);
        setTotalCount(data.totalElements);
      } catch (error) {
        const apiError = error as ApiError;
        const response = apiError.response?.data?.message;

        alert(response ?? "오류가 발생했습니다.");
        console.error("이슈 조회 실패", error);
      }
    };

    fetchData();
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
      minWidth: 500,
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
      minWidth: 100,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const status = params.value;
        let bgColor = "";
        let textColor = "";

        if (status === "진행중") {
          bgColor = "bg-blue-100";
          textColor = "text-blue-700";
        } else {
          bgColor = "bg-red-100";
          textColor = "text-red-700";
        }

        return (
          <span
            className={`px-3 py-1 text-sm font-semibold rounded-sm ${bgColor} ${textColor}`}
          >
            {status}
          </span>
        );
      },
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

  // 검색 필터
  const [searchQuery, setSearchQuery] = useState("");
  const filteredData = data.filter((item) => {
    const query = searchQuery.toLowerCase();

    return (
      item.title.toLowerCase().includes(query) || // 제목
      item.status.toLowerCase().includes(query) || // 상태
      item.categoryName.toLowerCase().includes(query) || // 카테고리
      item.hostName.toLowerCase().includes(query) || // 주관자
      item.departmentName.some(
        (
          dept // 부서 (리스트 형태 처리)
        ) => dept.toLowerCase().includes(query)
      )
    );
  });

  return (
    <>
      {/* 타이틀 */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-end" // 타이틀과 버튼 하단 정렬
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
      </Box>
      <PageHeader>
        <Toggle
          options={[
            { label: "리스트", value: "list", path: "/issue/list" },
            { label: "칸반", value: "kanban", path: "/issue/kanban" },
          ]}
        />
        <AddButton onClick={() => navigate("/issue/create")} />
        <Box display="flex" alignItems="center" gap={1.5}>
          <SearchBar onSearch={setSearchQuery} placeholder="검색" />
        </Box>
      </PageHeader>

      <ListDataGrid<IssueListItem>
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
