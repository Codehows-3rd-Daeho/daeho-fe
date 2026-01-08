import { type GridColDef, type GridRenderCellParams } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { ListDataGrid } from "../../common/List/ListDataGrid";
import { CommonPagination } from "../../common/Pagination/Pagination";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { PageHeader } from "../../common/PageHeader/PageHeader";
import { AddButton } from "../../common/PageHeader/AddButton/Addbutton";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { getStatusLabel } from "../../common/commonFunction";
import type { MeetingListItem } from "../../meeting/type/type";
import { getMeetingListMT } from "../../meeting/api/MeetingApi";
import type { ApiError } from "../../config/httpClient";
import { SearchBar } from "../../common/SearchBar/SearchBar";
import DateFilter from "../../common/PageHeader/DateFilter";
import Filter from "../../common/PageHeader/Filter";
import type { FilterDto } from "../../common/PageHeader/type";
import LockIcon from "@mui/icons-material/Lock";

export default function MeetingList() {
  const navigate = useNavigate();
  const { member } = useAuthStore();

  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
    getMeetingListMT(member!.memberId, page - 1, 10, filter)
      .then((data) => {
        const list = (data.content ?? data).map((item: MeetingListItem) => ({
          ...item,
          status: getStatusLabel(item.status),
        }));

        setData(list);
        setTotalCount(data.totalElements || 0); // 전체 개수
      })
      .catch((error) => {
        const apiError = error as ApiError;
        const response = apiError.response?.data?.message;
        alert(response ?? "오류가 발생했습니다.");
      });
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
      flex: isMobile ? 1 : 2,
      minWidth: isMobile ? 300 : 600,
      headerAlign: "center",
      align: "left",
      renderCell: (params: GridRenderCellParams<MeetingListItem>) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            cursor: "pointer",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          onClick={() => navigate(`/meeting/${params.id}`)}
        >
          {/* 비밀글일 때만 자물쇠 아이콘 표시 */}
          {params.row.isPrivate && (
            <LockIcon
              sx={{
                fontSize: 18,
                mr: 1,
                color: "text.secondary",
                flexShrink: 0,
              }}
            />
          )}
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

  const displayColumns = isMobile
    ? allColumns.filter((col) => col.field === "title")
    : allColumns;

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
          minWidth={100}
        >
          회의
        </Typography>
        <AddButton onClick={() => navigate("/meeting/create")} />
      </Box>

      <PageHeader>
        {(width) => (
          <>
            <Box /> {/* 왼쪽 공간 확보 */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {width >= 900 && ( // md 대신 containerWidth 기준
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  {/* 날짜 필터 */}
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

                  {/* 공통 필터 (부서, 카테고리, 상태 등) */}
                  <Filter
                    type="meeting"
                    value={filter}
                    onChange={(f) => {
                      setPage(1);
                      setFilter(f);
                    }}
                  />
                </Box>
              )}

              {/* 검색창 */}
              <SearchBar
                onSearch={(val) =>
                  setFilter((prev) => ({ ...prev, keyword: val }))
                }
                placeholder="회의 제목 검색"
              />
            </Box>
          </>
        )}
      </PageHeader>
      {/* 리스트 */}
      <ListDataGrid<MeetingListItem>
        rows={data}
        columns={displayColumns}
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
