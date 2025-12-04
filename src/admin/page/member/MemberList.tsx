import { Box, Button } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useState } from "react";
import MemberModal from "./MemberModal";

export default function MemberList() {
  const [open, setOpen] = useState(false);
  const handleModalOpen = () => setOpen(true);
  const handleModalClose = () => setOpen(false);

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      headerAlign: "center",
      align: "center",
      width: 90,
    },
    {
      field: "name",
      headerName: "이름",
      headerAlign: "center",
      align: "center",
      width: 150,
    },
    {
      field: "department",
      headerName: "부서",
      headerAlign: "center",
      align: "center",

      width: 120,
    },
    {
      field: "position",
      headerName: "직급",
      headerAlign: "center",
      align: "center",

      width: 120,
    },
    {
      field: "phone",
      headerName: "전화번호",
      headerAlign: "center",
      align: "center",

      width: 140,
    },
    {
      field: "email",
      headerName: "이메일",
      headerAlign: "center",
      align: "center",
      width: 200,
    },
    {
      field: "isEmployed",
      headerName: "재직여부",
      headerAlign: "center",
      align: "center",
      width: 100,
      renderCell: (params) => (params.value ? "재직중" : "퇴사"),
    },
  ];

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button variant="outlined" color="primary" onClick={handleModalOpen}>
          회원등록
        </Button>
      </Box>
      <MemberModal open={open} onClose={handleModalClose} />

      <DataGrid
        // rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        disableRowSelectionOnClick
        pageSizeOptions={[10, 20, 30]}
        initialState={{
          pagination: { paginationModel: { page: 0, pageSize: 15 } },
        }}
      />
    </>
  );
}
