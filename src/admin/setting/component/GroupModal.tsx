// GroupDialog.tsx
import { useState, useEffect } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Checkbox,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Typography,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { getDepartment, createGroup, updateGroup } from "../api/MasterDataApi";
import { getPartMemberList } from "../../member/api/MemberApi";
import type { PartMemberList } from "../../../issue/type/type";
import type { Group } from "../type/SettingType";
import type { ApiError } from "../../../config/httpClient";

interface GroupDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingGroup: Group | null;
}

export default function GroupModal({
  open,
  onClose,
  onSuccess,
  editingGroup,
}: GroupDialogProps) {
  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState<PartMemberList[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [departments, setDepartments] = useState<string[]>(["전체"]);
  const [departmentFilter, setDepartmentFilter] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 데이터 로드
  useEffect(() => {
    if (!open) return;

    const loadData = async () => {
      try {
        setIsLoading(true);
        const deptList = await getDepartment();
        setDepartments(["전체", ...deptList.map((d) => d.name)]);

        const memberList = await getPartMemberList();
        setMembers(memberList);
      } catch (error) {
        const apiError = error as ApiError;
        if (apiError.response?.status === 401) return;
        const response = apiError.response?.data?.message;

        alert(response ?? "회원/부서 목록을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [open]);

  // 편집 그룹 초기화
  useEffect(() => {
    if (!open) return;

    const initialize = () => {
      setGroupName(editingGroup?.groupName || "");
      setSelectedMembers(editingGroup?.members.map((m) => m.id) || []);
      setDepartmentFilter("전체");
      setSearchQuery("");
    };

    // 다음 tick에 실행하도록 setTimeout
    setTimeout(initialize, 0);
  }, [editingGroup, open]);

  const handleToggleMember = (id: number) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!groupName.trim()) {
      alert("그룹명을 입력해주세요.");
      return;
    }
    if (selectedMembers.length === 0) {
      alert("회원을 선택해주세요.");
      return;
    }
    try {
      if (editingGroup) {
        // 그룹 수정
        await updateGroup(editingGroup.id, {
          groupName,
          memberIds: selectedMembers,
        });
        alert("그룹이 수정되었습니다.");
      } else {
        // 그룹 생성
        await createGroup({ groupName, memberIds: selectedMembers });
        alert("그룹이 생성되었습니다.");
      }
      onSuccess();
      onClose();
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.response?.status === 401) return;
      const response = apiError.response?.data?.message;

      alert(response ?? "그룹 생성에 실패했습니다.");
    }
  };
  const filteredMembers = members.filter((m) => {
    const name = m.name || "";
    const position = m.jobPositionName || "";
    const dept = m.department || "";

    return (
      (departmentFilter === "전체" || dept === departmentFilter) &&
      (name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        position.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
          width: "100%",
          minWidth: "1000px",
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">
            {editingGroup ? "그룹 수정" : "그룹 추가"}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <TextField
          fullWidth
          label="그룹명"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="그룹명을 입력하세요"
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>부서</InputLabel>
            <Select
              value={departmentFilter}
              label="부서"
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            placeholder="이름 또는 직급 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box sx={{ maxHeight: 400, overflow: "auto" }}>
          {filteredMembers.map((member) => (
            <Box
              key={member.id}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 1,
                mb: 1,
                bgcolor: selectedMembers.includes(member.id)
                  ? "primary.50"
                  : "white",
                borderRadius: 1,
                border: "1px solid #e2e8f0",
                cursor: "pointer",
                "&:hover": { bgcolor: "#f1f5f9" },
              }}
              onClick={() => handleToggleMember(member.id)}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Checkbox checked={selectedMembers.includes(member.id)} />
                <Box>
                  <Typography sx={{ fontWeight: 600 }}>
                    {member.name} {member.jobPositionName || ""}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748b" }}>
                    {member.department}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>

        {selectedMembers.length > 0 && (
          <Box sx={{ mt: 2, p: 2, bgcolor: "#eff6ff", borderRadius: 1 }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, mb: 1, color: "#1e40af" }}
            >
              선택된 회원 ({selectedMembers.length}명)
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {selectedMembers.map((id) => {
                const member = members.find((m) => m.id === id);
                return member ? (
                  <Chip
                    key={id}
                    label={`${member.name} ${member.jobPositionName || ""}`}
                    size="small"
                    onDelete={() => handleToggleMember(id)}
                    sx={{ bgcolor: "white" }}
                  />
                ) : null;
              })}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>취소</Button>
        <Button variant="contained" onClick={handleSave}>
          {editingGroup ? "수정" : "저장"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
