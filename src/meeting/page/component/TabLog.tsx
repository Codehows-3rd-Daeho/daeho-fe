import { CommonPagination } from "../../../common/Pagination/Pagination";
import type { GridColDef, GridValueGetter } from "@mui/x-data-grid";
import { useEffect, useState } from "react";

import { ListDataGrid } from "../../../common/List/ListDataGrid";
import { getMeetingLog } from "../../api/MeetingLogApi";

export type MeetingLoglist = {
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

type TabLogProps = {
  meetingId: string;
};

export default function TabLog({ meetingId }: TabLogProps) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<MeetingLoglist[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const changeTypeMap: Record<string, string> = {
    CREATE: "생성",
    UPDATE: "수정",
    DELETE: "삭제",
  };

  const pageSize = 5;

  useEffect(() => {
    if (!meetingId) return;

    getMeetingLog(meetingId, page - 1, pageSize)
      .then((res) => {
        const content = res.content || [];
        const total = res.totalElements || 0;

        const list = content.map((item: MeetingLoglist, index: number) => ({
          ...item,
          // 역순 번호 계산
          no: total - ((page - 1) * pageSize + index),
        }));

        setData(list);
        setTotalCount(total);
      })
      .catch((err) => {
        console.error("로그 로딩 실패:", err);
      });
  }, [meetingId, page]);

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
      <ListDataGrid<MeetingLoglist>
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
