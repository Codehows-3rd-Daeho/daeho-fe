import { type GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { ListDataGrid } from "../../common/List/ListDataGrid";
import { CommonPagination } from "../../common/Pagination/Pagination";
import { Box, Typography } from "@mui/material";
import { PageHeader } from "../../common/PageHeader/PageHeader";
import { AddButton } from "../../common/PageHeader/AddButton/Addbutton";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { getStatusLabel } from "../../common/commonFunction";
import type { MeetingListItem } from "../../meeting/type/type";
import { getMeetingListMT } from "../../meeting/api/MeetingApi";

export default function MeetingList() {
  const navigate = useNavigate();
  const { member } = useAuthStore();
  const role = member?.role;

  const [page, setPage] = useState(1);
  const [data, setData] = useState<MeetingListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    getMeetingListMT(member!.memberId, page - 1, 10).then((data) => {
      const list = (data.content ?? data).map((item: MeetingListItem) => ({
        ...item,
        status: getStatusLabel(item.status),
      }));

      setData(list);
      setTotalCount(data.totalElements); // 전체 개수
    });
  }, [page]);

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
      minWidth: 80,
      headerAlign: "center",
      align: "center",
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
      <Box mb={2}>
        <Typography
          variant="h4"
          component="h1"
          textAlign="left"
          fontWeight="bold"
        >
          회의
        </Typography>
      </Box>

      <PageHeader>
        <Box />
        {role === "USER" && (
          <AddButton onClick={() => navigate("/meeting/create")} />
        )}
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
