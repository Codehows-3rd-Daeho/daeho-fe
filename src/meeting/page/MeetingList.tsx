import { type GridColDef, type GridRenderCellParams } from "@mui/x-data-grid";
import { useState } from "react";
import type { MeetingListItem } from "../type";
import { mockMeetingList } from "../mock/meetingListMock";
import { ListDataGrid } from "../../common/List/ListDataGrid";

export function MeetingList() {
  const [meetings, setMeetings] = useState<MeetingListItem[]>(
    mockMeetingList.map((item) => ({ ...item, isDel: false }))
  );

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
      minWidth: 180,
      headerAlign: "center",
      align: "left",
    },
    {
      field: "period",
      headerName: "기간",
      flex: 1.2,
      minWidth: 160,
      headerAlign: "center",
      align: "center",
      renderCell: (params: GridRenderCellParams<MeetingListItem>) => {
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
      field: "department",
      headerName: "부서",
      flex: 1,
      minWidth: 120,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "category",
      headerName: "주제",
      flex: 1,
      minWidth: 120,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "isHost",
      headerName: "주관자",
      flex: 1,
      minWidth: 120,
      headerAlign: "center",
      align: "center",
    },
  ];

  const deleteMeeting = (id: number) => {
    setMeetings((prev) =>
      prev.map((meeting) =>
        meeting.id === id ? { ...meeting, isDel: true } : meeting
      )
    );
  };

  return (
    <ListDataGrid<MeetingListItem>
      title="회의"
      rows={meetings}
      columns={allColumns}
      rowIdField="id"
      onRowDelete={(row) => deleteMeeting(row.id)}
    />
  );
}
