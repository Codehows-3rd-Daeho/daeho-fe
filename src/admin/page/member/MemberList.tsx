import { Box, Button } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useState } from "react";
import MemberModal from "./MemberModal";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/useAuthStore";

export default function MemberList() {
  const [open, setOpen] = useState(false);
  const handleModalOpen = () => setOpen(true);
  const handleModalClose = () => setOpen(false);
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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

  const rows = [
    {
      id: 1,
      name: "홍길동",
      department: "개발팀",
      position: "사원",
      phone: "010-1234-5678",
      email: "hong@example.com",
      isEmployed: true,
      createdAt: "2025-11-24",
    },
    {
      id: 2,
      name: "김철수",
      department: "영업팀",
      position: "대리",
      phone: "010-2345-6789",
      email: "kim@example.com",
      isEmployed: true,
      createdAt: "2025-11-20",
    },
    {
      id: 3,
      name: "이영희",
      department: "인사팀",
      position: "과장",
      phone: "010-3456-7890",
      email: "lee@example.com",
      isEmployed: false,
      createdAt: "2025-10-15",
    },
    {
      id: 4,
      name: "박민수",
      department: "개발팀",
      position: "팀장",
      phone: "010-4567-8901",
      email: "park@example.com",
      isEmployed: true,
      createdAt: "2025-09-30",
    },
  ];

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleLogout}
        >
          로그아웃
        </Button>
        <Button variant="outlined" color="primary" onClick={handleModalOpen}>
          회원등록
        </Button>
      </Box>
      <MemberModal open={open} onClose={handleModalClose} />

      <DataGrid
        rows={rows}
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
