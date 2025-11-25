import { Box, Pagination, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { CommonDataGridProps } from "./type";

export function ListDataGrid<T extends { [key: string]: unknown }>({
  title,
  rows,
  columns,
  rowIdField,
  onRowDelete,
}: CommonDataGridProps<T>) {
  const filteredRows = rows.filter((row) => !row.isDel); // isDel 필드가 있는 경우 삭제 필터링

  return (
    <Box sx={{ p: 2 }}>
      {title && (
        <Typography variant="h5" sx={{ mb: 2 }}>
          {title}
        </Typography>
      )}
      <Box sx={{ width: "100%" }}>
        <DataGrid<T>
          columnHeaderHeight={48}
          rows={filteredRows}
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
      <Pagination count={10} variant="outlined" shape="rounded" />
    </Box>
  );
}
