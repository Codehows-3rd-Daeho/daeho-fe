import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { MeetingListItem } from "../../../meeting/type/type";
import { getStatusLabel } from "../../../common/commonFunction";
import type { GridColDef } from "@mui/x-data-grid";
import { ListDataGrid } from "../../../common/List/ListDataGrid";
import { CommonPagination } from "../../../common/Pagination/Pagination";
import { getMeetingRelatedIssue } from "../../api/issueApi";
import type { ApiError } from "../../../config/httpClient";
import { useMediaQuery, useTheme } from "@mui/material";

export default function TabMeeting() {
  const navigate = useNavigate();
  const { issueId } = useParams();

  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [page, setPage] = useState(1);
  const [data, setData] = useState<MeetingListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    getMeetingRelatedIssue(issueId as string, page - 1, 5)
      .then((data) => {
        const list = (data.content ?? data).map((item: MeetingListItem) => ({
          ...item,
          status: getStatusLabel(item.status),
        }));
        setData(list);
        setTotalCount(data.totalElements);
      })
      .catch((error) => {
        const apiError = error as ApiError;
        if (apiError.response?.status === 401) return;
        const response = apiError.response?.data?.message;
        alert(response ?? "오류가 발생했습니다.");
      });
  }, [issueId, page]);

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
      minWidth: isMobile ? 150 : 180,
      headerAlign: "center",
      align: "left",
      renderCell: (params) => (
        <div
          style={{
            width: "100%",
            cursor: "pointer",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          onClick={() => navigate(`/meeting/${params.id}`)}
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
      field: "startDate",
      headerName: "일시",
      flex: 1.2,
      minWidth: 160,
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
    },
    {
      field: "categoryName",
      headerName: "주제",
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
