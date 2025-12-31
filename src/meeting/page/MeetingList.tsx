import { type GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import type { MeetingListItem } from "../type/type";
import { ListDataGrid } from "../../common/List/ListDataGrid";
import { CommonPagination } from "../../common/Pagination/Pagination";
import { Box, Typography } from "@mui/material";
import { PageHeader } from "../../common/PageHeader/PageHeader";
import { AddButton } from "../../common/PageHeader/AddButton/Addbutton";
import { useNavigate } from "react-router-dom";
import { getMeetingListSrc } from "../api/MeetingApi";
import { getStatusLabel } from "../../common/commonFunction";
import { SearchBar } from "../../common/SearchBar/SearchBar";
import Filter from "../../common/PageHeader/Filter";
import DateFilter from "../../common/PageHeader/DateFilter";
import type { FilterDto } from "../../common/PageHeader/type";

export default function MeetingList() {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [data, setData] = useState<MeetingListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);

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
    const fetchData = async () => {
      try {
        const data = await getMeetingListSrc(page - 1, 10, filter);
        const list = (data.content ?? data).map((item: MeetingListItem) => ({
          ...item,
          status: getStatusLabel(item.status),
        }));

        setData(list);
        setTotalCount(data.totalElements);
      } catch (error) {
        console.error("회의 조회 실패", error);
      }
    };
    fetchData();
  }, [page, filter]);

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
          onClick={() => navigate(`/meeting/${params.id}`)}
        >
          {params.value}
        </div>
      ),
    },
    {
      field: "status",
      headerName: "상태",
      flex: 0.5,
      minWidth: 100,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const status = params.value;
        let bgColor = "";
        let textColor = "";

        if (status === "진행전") {
          bgColor = "bg-green-100";
          textColor = "text-green-700";
        } else if (status === "진행중") {
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
      field: "startDate",
      headerName: "일시",
      flex: 1.2,
      minWidth: 190,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "departmentName",
      headerName: "부서",
      flex: 1,
      minWidth: 120,
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
      minWidth: 120,
      headerAlign: "center",
      align: "center",
    },
  ];

  return (
    <>
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
          회의
        </Typography>
        <AddButton onClick={() => navigate("/meeting/create")} />
      </Box>

      <PageHeader>
        {/* 탭 공간 (왼쪽) */}
        <Box />

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
              setPage(1); // 필터 변경 시 1페이지로 이동
              setFilter(f);
            }}
          />

          <SearchBar
            onSearch={(value) =>
              setFilter((prev) => ({ ...prev, keyword: value }))
            }
            placeholder="검색"
          />
        </Box>
      </PageHeader>
      {/* 리스트 */}
      <ListDataGrid<MeetingListItem>
        rows={data}
        columns={allColumns}
        rowIdField="id"
      />
      {/* 페이징 */}
      <CommonPagination
        page={page}
        totalCount={totalCount}
        onPageChange={setPage}
      />
    </>
  );
}
