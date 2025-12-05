import { Box, Button } from "@mui/material";
import { type GridColDef } from "@mui/x-data-grid";
import { useCallback, useEffect, useState } from "react";
import { getMemberList } from "../api/MemberApi";
import axios from "axios";
import type { MemberList } from "../type/MemberType";
import { ListDataGrid } from "../../../common/List/ListDataGrid";
import { CommonPagination } from "../../../common/Pagination/Pagination";
import CreateMemberModal from "../component/CreateMemberModal";
import UpdateMemberModal from "../component/UpdateMemberModal";

export default function MemberList() {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

  // 페이지네이션
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10); // 사이즈 고정
  const [rows, setRows] = useState<MemberList[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const handleModalOpen = () => setOpen(true);
  const handleModalClose = () => setOpen(false);
  const handleEditOpen = (id: number) => {
    setSelectedMemberId(id);
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setSelectedMemberId(null);
    setEditOpen(false);
  };

  const loadData = useCallback(async () => {
    try {
      const data = await getMemberList(page - 1, pageSize);
      setRows(data.content);
      setTotalCount(data.totalElements);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) return;
      alert("회원 정보 조회 중 오류가 발생했습니다.");
    }
  }, [page, pageSize]);

  useEffect(() => {
    (async () => {
      await loadData();
    })();
  }, [loadData]);

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
      width: 120,
      renderCell: (params) => (
        <Button
          variant="text"
          onClick={() => handleEditOpen(params.row.id)}
          sx={{ textTransform: "none", padding: 0 }}
        >
          {params.value}
        </Button>
      ),
    },
    {
      field: "departmentName",
      headerName: "부서",
      headerAlign: "center",
      align: "center",

      width: 120,
    },
    {
      field: "jobPositionName",
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

      {/* 회원 등록 모달 */}
      <CreateMemberModal
        open={open}
        onClose={handleModalClose}
        loadData={loadData}
      />

      {selectedMemberId !== null && (
        <UpdateMemberModal
          open={editOpen}
          onClose={handleEditClose}
          loadData={loadData}
          memberId={selectedMemberId}
        />
      )}
      <ListDataGrid
        columns={columns}
        rows={rows}
        rowIdField="id"
        // maxWidth={"900px"}
      />

      <CommonPagination
        page={page}
        totalCount={totalCount}
        onPageChange={setPage}
      />
    </>
  );
}
