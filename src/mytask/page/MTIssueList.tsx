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
import { SearchBar } from "../../common/SearchBar/SearchBar";
import DateFilter from "../../common/PageHeader/DateFilter";
import Filter from "../../common/PageHeader/Filter";
import type { FilterDto } from "../../common/PageHeader/type";

export default function MTIssueList() {
  const navigate = useNavigate();
  const { member } = useAuthStore();
  const role = member?.role;
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
  // 페이징
  const [page, setPage] = useState(1);
  const [data, setData] = useState<IssueListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  // 데이터 가져오기
  useEffect(() => {
    if (!member?.memberId) return;

    getIssueListMT(member.memberId, page - 1, 10, filter).then((data) => {
      const list = (data.content ?? data).map((item: IssueListItem) => ({
        ...item,
        status: getStatusLabel(item.status),
      }));

      setData(list);
      setTotalCount(data.totalElements); // 전체 개수
    }).catch((error) => {
      const apiError = error as ApiError;
      const response = apiError.response?.data?.message;
      alert(response ?? "오류가 발생했습니다.");
    });
  }, [page, filter, member?.memberId]);

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
          minWidth={100}
        >
          이슈
        </Typography
        <AddButton onClick={() => navigate("/issue/create")} />
      </Box>

      <PageHeader>
        <Box sx={{ alignSelf: "center" }}>
          <Toggle
            options={[
              { label: "리스트", value: "list", path: "/mytask/issue/list" },
              { label: "칸반", value: "kanban", path: "/mytask/issue/kanban" },
            ]}
          />
        </Box>

        {/* 3. 오른쪽: 필터 UI 추가 (IssueList와 동일한 구조) */}
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
            type="meeting"
            value={filter}
            onChange={(f) => {
              setPage(1);
              setFilter(f);
            }}
          />

          <SearchBar
            placeholder="검색"
            onSearch={(value) =>
              setFilter((prev) => ({ ...prev, keyword: value }))
            }
          />
        </Box>
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
