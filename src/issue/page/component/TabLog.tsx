import { CommonPagination } from "../../../common/Pagination/Pagination";
import type { GridColDef, GridValueGetter } from "@mui/x-data-grid";
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
  memberName: string;
  no?: number;
};

export default function TabLog() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<IssueLoglist[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const { issueId } = useParams();
  const changeTypeMap: Record<string, string> = {
    CREATE: "생성",
    UPDATE: "수정",
    DELETE: "삭제",
  };

  const pageSize = 5;

  useEffect(() => {
    getIssueLog(issueId as string, page - 1, pageSize).then((data) => {
      const list = (data.content ?? data).map(
        (item: IssueLoglist, index: number) => ({
          ...item,
          no: data.totalElements - ((page - 1) * pageSize + index),
        })
      );

      setData(list);
      setTotalCount(data.totalElements);
    });
  }, [issueId, page]);

  const allColumns: GridColDef[] = [
    {
      field: "no",
      headerName: "no",
      flex: 0.5,
      minWidth: 50,
      headerAlign: "center",
      align: "center",
      sortable: false,
    },
    {
      field: "createTime",
      headerName: "시간",
      flex: 2,
      minWidth: 150,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "memberName",
      headerName: "사용자",
      flex: 1.2,
      minWidth: 100,
      headerAlign: "center",
      align: "center",
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
      flex: 1,
      minWidth: 120,
      headerAlign: "center",
      align: "left",
      renderCell: (params) => {
        const text = params.value as string;
        const maxLength = 20;

        if (!text) return "";

        return (
          <div
            title={text}
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {text.length > maxLength ? `${text.slice(0, maxLength)}...` : text}
          </div>
        );
      },
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
