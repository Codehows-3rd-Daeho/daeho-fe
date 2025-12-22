import { CommonPagination } from "../../../common/Pagination/Pagination";
import type { GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { getIssueLog } from "../../api/issueLogApi";
import { useParams } from "react-router-dom";
import { ListDataGrid } from "../../../common/List/ListDataGrid";

export type IssueLoglist = {
  id: number;
  targetId: number;
  targetType: string;
  changeType: string;
  message: string;
  updateField: string;
  createTime: Date;
  createBy: number;
};

export default function TabLog() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<IssueLoglist[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const { issueId } = useParams();

  useEffect(() => {
    getIssueLog(issueId as string, page - 1, 5).then((data) => {
      const list = (data.content ?? data).map((item: IssueLoglist) => ({
        ...item,
      }));
      setData(list);
      setTotalCount(data.totalElements);
    });
  }, [issueId, page]);

  const allColumns: GridColDef[] = [
    {
      field: "id",
      headerName: "no",
      flex: 0.5,
      minWidth: 60,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "",
      headerName: "상태",
      flex: 2,
      minWidth: 80,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "",
      headerName: "일시",
      flex: 1.2,
      minWidth: 160,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "",
      headerName: "부서",
      flex: 1,
      minWidth: 120,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "",
      headerName: "주제",
      flex: 1,
      minWidth: 120,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "",
      headerName: "주관자",
      flex: 1,
      minWidth: 120,
      headerAlign: "center",
      align: "center",
    },
  ];

  return (
    <>
      {/* 리스트 */}
      <ListDataGrid<IssueLoglist>
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
