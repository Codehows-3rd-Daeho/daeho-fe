import { Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { CommonDataGridProps } from "./type";

export function ListDataGrid<T extends { [key: string]: unknown }>({
  columns,
  rows,
  rowIdField,
  onRowDelete,
}: CommonDataGridProps<T>) {
  return (
    <>
      <Box sx={{ p: 2 }}>
        <Box sx={{ width: "100%" }}>
          <DataGrid<T>
            columnHeaderHeight={48}
            rows={rows} // 더미사용중이라 rows 나중에 data로 변경
            columns={columns}
            getRowId={(row) => row[rowIdField] as string | number}
            disableRowSelectionOnClick
            autoHeight
            sx={{
              "& .MuiDataGrid-columnHeaders": { fontWeight: "bold" },
              "& .MuiDataGrid-footerContainer": { display: "none" },
              "& .MuiDataGrid-virtualScroller": { overflowX: "auto" },
            }}
            onRowDoubleClick={(params) => {
              if (onRowDelete) onRowDelete(params.row);
            }}
          />
        </Box>
      </Box>
    </>
  );
}
