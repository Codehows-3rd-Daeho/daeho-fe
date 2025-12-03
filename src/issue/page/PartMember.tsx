import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
  IconButton,
  Tabs,
  Tab,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { IssueMemberDto, PartMemberList } from "../type/type";
import { getPartMemberList } from "../../admin/api/MemberApi";
import { getDepartment, getJobPosition } from "../../admin/api/MasterDataApi";
import { useAuthStore } from "../../store/useAuthStore";

interface Participant extends PartMemberList {
  selected: boolean;
  hasEditPermission: boolean;
}
interface PartMemberProps {
  onChangeMembers: (members: IssueMemberDto[]) => void;
}

//부서랑 직급을 백에서 받아와야됨
type CategoryType = string;

type ParticipantList = {
  [key: string]: Participant[];
};

export default function PartMember({ onChangeMembers }: PartMemberProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [categories, setCategories] = useState<CategoryType[]>(["전체"]);

  const [participants, setParticipants] = useState<ParticipantList>({});

  const currentCategory = categories[activeTab];
  const currentParticipants = participants[currentCategory] || [];

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("PartMember useEffect 실행");
        const positions = await getJobPosition(); // 직급 [{id, name}]
        console.log("PartMember positions", positions);
        const departments = await getDepartment(); // 부서 [{id, name}]
        console.log("PartMember departments", departments);

        const positionNames = positions.map((p) => p.name);
        const departmentNames = departments.map((d) => d.name);

        // 전체 + 직급 + 부서
        setCategories(["전체", ...positionNames, ...departmentNames]);

        // 2) 회원 전체 불러오기
        const memberList = await getPartMemberList();
        console.log("PartMember memberList", memberList);

        // 3) 기본값 추가한 Participant 형태로 변환
        const mapped: Participant[] = memberList.map((m) => ({
          ...m,
          selected: false,
          hasEditPermission: false,
        }));

        // 4) 카테고리별 분류
        const categorized: ParticipantList = {
          전체: mapped,
        };

        // 직급별 분류
        positionNames.forEach((pos) => {
          categorized[pos] = mapped.filter((m) => m.position === pos);
        });

        // 부서별 분류
        departmentNames.forEach((dept) => {
          categorized[dept] = mapped.filter((m) => m.department === dept);
        });

        setParticipants(categorized);
      } catch (error) {
        console.error("카테고리/참여자 로딩 실패:", error);
      }
    };

    loadData();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSelectParticipant = (id: number) => {
    setParticipants((prev) => ({
      ...prev,
      [currentCategory]: prev[currentCategory].map((p) =>
        p.id === id ? { ...p, selected: !p.selected } : p
      ),
    }));
  };

  const handleTogglePermission = (id: number) => {
    setParticipants((prev) => ({
      ...prev,
      [currentCategory]: prev[currentCategory].map((p) =>
        p.id === id ? { ...p, hasEditPermission: !p.hasEditPermission } : p
      ),
    }));
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setParticipants((prev) => ({
      ...prev,
      [currentCategory]: prev[currentCategory].map((p) => ({
        ...p,
        selected: checked,
      })),
    }));
  };

  const handleSelectAllPermissions = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checked = event.target.checked;
    setParticipants((prev) => ({
      ...prev,
      [currentCategory]: prev[currentCategory].map((p) => ({
        ...p,
        hasEditPermission: checked,
      })),
    }));
  };
  // 로그인된 사용자 id
  const { memberId } = useAuthStore();

  console.log("memberId type:", typeof memberId);

  const handleSave = () => {
    const selectedParticipants = Object.values(participants)
      .flat()
      .filter((p) => p.selected || p.id === memberId); // 선택되었거나 host이면 포함

    const result: IssueMemberDto[] = selectedParticipants.map((p) => ({
      memberId: p.id,
      memberName: p.name,
      isHost: p.id == memberId, // 로그인된 멤버면 true
      isPermitted: p.hasEditPermission,
      isRead: false,
    }));

    console.log("=======================host 확인=================");
    console.log("memberId: ", memberId);
    console.log("result", result);
    onChangeMembers(result); // 부모에게 전달
    handleClose();
  };

  const allSelected =
    currentParticipants.length > 0 &&
    currentParticipants.every((p) => p.selected);
  const allHavePermission =
    currentParticipants.length > 0 &&
    currentParticipants.every((p) => p.hasEditPermission);

  return (
    <>
      <Button
        fullWidth
        variant="outlined"
        size="small"
        onClick={handleOpen}
        sx={{
          justifyContent: "flex-start",
          color: "text.secondary",
          borderRadius: 1.5,
          textTransform: "none",
        }}
      >
        참여자 추가
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { height: "600px", maxHeight: "90vh" },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 2,
          }}
        >
          <Typography variant="h6" component="div">
            참여자 추가
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* 왼쪽 세로 탭 */}
          <Tabs
            orientation="vertical"
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              borderRight: 1,
              borderColor: "divider",
              minWidth: 180,
              "& .MuiTab-root": {
                alignItems: "flex-start",
                textAlign: "left",
                px: 3,
                py: 2,
                minHeight: 48,
              },
            }}
          >
            {categories.map((category) => (
              <Tab key={category} label={category} />
            ))}
          </Tabs>

          {/* 오른쪽 컨텐츠 */}
          <DialogContent sx={{ flex: 1, pt: 3 }}>
            {/* 전체 선택 */}
            <Box
              sx={{
                display: "flex",
                gap: 4,
                pb: 2,
                mb: 3,
                borderBottom: 1,
                borderColor: "divider",
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={allSelected}
                    onChange={handleSelectAll}
                    size="small"
                  />
                }
                label="참여자 전체선택"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={allHavePermission}
                    onChange={handleSelectAllPermissions}
                    size="small"
                  />
                }
                label="관한 전체선택"
              />
            </Box>

            {/* 참여자 목록 */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {currentParticipants.map((participant) => (
                <Box
                  key={participant.id}
                  sx={{ display: "flex", gap: 4, alignItems: "center" }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={participant.selected}
                        onChange={() => handleSelectParticipant(participant.id)}
                        size="small"
                      />
                    }
                    label={`${participant.name} ${participant.position}`}
                    sx={{ minWidth: 160 }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={participant.hasEditPermission}
                        onChange={() => handleTogglePermission(participant.id)}
                        size="small"
                      />
                    }
                    label="수정/삭제 관한"
                    sx={{ color: "text.secondary" }}
                  />
                </Box>
              ))}
            </Box>
          </DialogContent>
        </Box>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleSave} variant="contained">
            저장
          </Button>
          <Button onClick={handleClose} variant="outlined" color="inherit">
            취소
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
