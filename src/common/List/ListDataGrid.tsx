import { Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { CommonDataGridProps } from "./type";

export function ListDataGrid<T extends object>({
  columns,
  rows,
  rowIdField,
}: CommonDataGridProps<T>) {
  return (
    <>
      <Box sx={{ p: 2 }}>
        <Box
          sx={
            {
              // width: "100%",
            }
          }
        >
          <DataGrid<T>
            columnHeaderHeight={48}
            rows={rows} //
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
