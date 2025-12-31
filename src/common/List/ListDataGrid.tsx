import { Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { CommonDataGridProps } from "./type";

export function ListDataGrid<T extends object>({
  columns,
  rows,
  rowIdField,
  maxWidth = "100%", // 기본값 100%
}: CommonDataGridProps<T>) {
  return (
    <>
      <Box sx={{ pt: 2, display: "flex", justifyContent: "center" }}>
        <Box sx={{ width: "100%", maxWidth, minWidth: "100px" }}>
          <DataGrid<T>
            columnHeaderHeight={48}
            rows={rows}
            columns={columns}
            getRowId={(row) => row[rowIdField] as string | number}
            disableRowSelectionOnClick
            autoHeight
            sx={{
              "& .MuiDataGrid-columnHeaders": { fontWeight: "bold" },
              "& .MuiDataGrid-footerContainer": { display: "none" },
              "& .MuiDataGrid-virtualScroller": { overflowX: "auto" },
            }}
          />
        </Box>
      </Box>
    </>
  );
}
