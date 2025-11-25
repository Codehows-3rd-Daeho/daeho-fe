import { type GridColDef, type GridRenderCellParams } from "@mui/x-data-grid";
import { useState } from "react";
import type { IssueListItem } from "../type";
import { mockIssueList } from "../mock/issueListMock";
import { ListDataGrid } from "../../common/List/ListDataGrid";

export function IssueList() {
  const [issues, setIssues] = useState<IssueListItem[]>(
    mockIssueList.map((item) => ({ ...item, isDel: false }))
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

  const deleteIssue = (id: number) => {
    setIssues((prev) =>
      prev.map((issue) => (issue.id === id ? { ...issue, isDel: true } : issue))
    );
  };

  return (
    <ListDataGrid<IssueListItem>
      title="이슈"
      rows={issues}
      columns={allColumns}
      rowIdField="id"
      onRowDelete={(row) => deleteIssue(row.id)}
    />
  );
}
