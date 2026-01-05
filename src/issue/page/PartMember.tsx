import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
  IconButton,
  Tabs,
  Tab,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import type { IssueMemberDto, PartMemberList } from "../type/type";
import { useAuthStore } from "../../store/useAuthStore";
import {
  getDepartment,
  getGroupList,
} from "../../admin/setting/api/MasterDataApi";
import { getPartMemberList } from "../../admin/member/api/MemberApi";
import type { Group } from "../../admin/setting/type/SettingType";
import type { ApiError } from "../../config/httpClient";

interface Participant extends PartMemberList {
  selected: boolean;
  isPermitted: boolean;
  isHost: boolean; // 수정시 참여자 명단에서 host 구별을 위함
}
interface PartMemberProps {
  onChangeMembers: (members: IssueMemberDto[]) => void;
  initialMembers?: IssueMemberDto[];
  mode: "create" | "update";
}

//부서 백에서 받아와야됨
type CategoryType = string;

export default function PartMember({
  onChangeMembers,
  initialMembers,
  mode,
}: PartMemberProps) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
    setIsSidebarOpen(!isMobile); 
  };
  const handleClose = () => setOpen(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);

  // 분류탭
  const [activeTab, setActiveTab] = useState(0);
  const [categories, setCategories] = useState<CategoryType[]>(["전체"]);
  const [allParticipants, setAllParticipants] = useState<Participant[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    if (isMobile) setIsSidebarOpen(false); // 모바일에서 카테고리 선택 시 탭 닫기
  };

  const currentCategory = categories[activeTab];

  // 현재 탭에 보여줄 멤버 필터링 (렌더링 시점에 계산)
  const currentParticipants =
    currentCategory === "전체"
      ? allParticipants
      : allParticipants.filter((p) => {
          const inDepartment = p.department === currentCategory;
          const inGroup = groups.some(
            (g) =>
              g.groupName === currentCategory &&
              g.members.some((m) => m.id === p.id)
          );
          return inDepartment || inGroup;
        });

  const { member } = useAuthStore();
  const memberId = member?.memberId;

  // 저장 로직 (배열 기준으로 중복 없이 처리)
  function handleSave(updatedList: Participant[]) {
    const selectedParticipants = updatedList.filter((p) => p.selected);

    const result: IssueMemberDto[] = selectedParticipants.map((p) => ({
      id: p.id,
      name: p.name,
      jobPositionName: p.jobPositionName || "",
      departmentName: p.department || "",
      isHost: p.isHost,
      isPermitted: p.isPermitted,
      isRead: false,
    }));

    onChangeMembers(result);
  }

  useEffect(() => {
    // 탭 생성 시 부서 + 그룹 합치기
    const loadData = async () => {
      try {
        const departments = await getDepartment();
        const departmentNames = departments.map((d) => d.name);

        const groupList = await getGroupList();
        setGroups(groupList);
        const groupNames = groupList.map((g) => g.groupName);

        setCategories(["전체", ...departmentNames, ...groupNames]);

        const memberList = await getPartMemberList();
        const initialMap = new Map(initialMembers?.map((m) => [m.id, m]));
        const mapped: Participant[] = memberList.map((m) => {
          const memberIdNum = Number(m.id);
          const existingMember = initialMap.get(memberIdNum);

          const isHost =
            mode === "update"
              ? existingMember?.isHost === true // 서버 값 사용
              : memberIdNum === Number(memberId); // create일 때만 로그인 유저

          return {
            ...m,
            isHost,
            selected: isHost || !!existingMember,
            isPermitted: isHost ? true : existingMember?.isPermitted ?? false,
          };
        });
        setAllParticipants(mapped);
        handleSave(mapped);
      } catch (error) {
        const apiError = error as ApiError;
        const response = apiError.response?.data?.message;
        alert(response ?? "로딩 오류가 발생했습니다.");
        console.error("로딩 실패:", error);
      }
    };

    loadData();
  }, [memberId, initialMembers, mode]);


  // 개별 선택 핸들러
  const handleSelectParticipant = (id: number) => {
    setAllParticipants((prev) => {
      const updated = prev.map((p) => {
        if (p.id !== id) return p;
        const nextSelected = !p.selected;
        return {
          ...p,
          selected: nextSelected,
          isPermitted: nextSelected ? p.isPermitted : false,
        };
      });
      handleSave(updated);
      return updated;
    });
  };

  // 참여자 전체선택
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    const currentIds = new Set(currentParticipants.map((p) => p.id));

    setAllParticipants((prev) => {
      const updated = prev.map((p) => {
        if (!currentIds.has(p.id)) return p;

        // host는 항상 유지
        if (p.isHost) {
          return {
            ...p,
            selected: true,
            isPermitted: true,
          };
        }

        return {
          ...p,
          selected: checked,
          isPermitted: checked ? p.isPermitted : false,
        };
      });

      handleSave(updated);
      return updated;
    });
  };

  const handleSelectAllPermissions = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checked = event.target.checked;
    const currentIds = new Set(currentParticipants.map((p) => p.id)); // 현재 탭 인원 ID 추출

    setAllParticipants((prev) => {
      const updated = prev.map((p) => {
        if (!currentIds.has(p.id)) return p;
        return {
          ...p,
          isPermitted: p.isHost ? true : checked, // isPermitted 상태를 함께 변경
          selected: checked || p.selected, // selected 상태도 함께 변경
        };
      });
      handleSave(updated);
      return updated;
    });
  };

  // 개별 권한 토글 핸들러
  const handleTogglePermission = (id: number) => {
    setAllParticipants((prev) => {
      const updated = prev.map((p) =>
        p.id === id ? { ...p, isPermitted: !p.isPermitted, selected: true } : p
      );
      handleSave(updated);
      return updated;
    });
  };

  // const selectedCount = allParticipants.filter((p) => p.selected).length;
  const allSelected =
    currentParticipants.length > 0 &&
    currentParticipants.every((p) => p.selected);
  const allHavePermission =
    currentParticipants.length > 0 &&
    currentParticipants.every((p) => p.isPermitted);

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
        참여자 추가 ({allParticipants.filter((p) => p.selected).length} 명)
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullScreen={isMobile}
        slotProps={{
          paper: {
            sx: {
              maxHeight: isMobile ? "100vh" : "90vh",
              width: isMobile ? "100%" : "750px",
            },
          },
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* 🍔 사이드바 토글 버튼 */}
            <IconButton onClick={() => setIsSidebarOpen(!isSidebarOpen)} size="small" color="primary">
              <MenuIcon />
            </IconButton>
          <Typography variant="h6" component="div">
            참여자 추가
          </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Box sx={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
          {/* 왼쪽 세로 탭 */}
          <Box
            sx={{
              width: isSidebarOpen ? (isMobile ? "100%" : 220) : 0,
              transition: "width 0.3s ease",
              overflow: "hidden",
              borderRight: isSidebarOpen && !isMobile ? 1 : 0,
              borderColor: "divider",
              position: isMobile ? "absolute" : "relative", 
              zIndex: 10,
              bgcolor: "background.paper",
              height: "100%",
            }}
          >
          <Tabs
            orientation="vertical"
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              borderRight: 1,
              borderColor: "divider",
              minWidth: 200,
              mb: 2,
              "& .MuiTab-root": {
                alignItems: "flex-start",
                textAlign: "left",
                px: 2.5,
                py: 1.5,
                minHeight: 44,
                textTransform: "none",
              },
              "& .Mui-selected": {
                fontWeight: 600,
                borderRadius: 1,
                mx: 1,
              },
            }}
          >
            {categories.map((category) => (
              <Tab key={category} label={category} />
            ))}
          </Tabs>
</Box>
          {/* 오른쪽 컨텐츠 */}
          <DialogContent
          dividers={false}
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              p: "0 !important", 
    "&:first-of-type": { pt: 0 }, 
    borderTop: "none",
    borderBottom: "none",
            }}
          >
            {/* 전체 선택 */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 200px",
                gap: 2,
                px: 1.5,
                pb: 2,
                mb: 1,
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
                sx={{ minWidth: 200, maxWidth: 200 }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={allHavePermission}
                    onChange={handleSelectAllPermissions}
                    size="small"
                  />
                }
                label="권한 전체선택"
              />
            </Box>

            {/* 참여자 목록 */}
            <Box
              sx={{
                display: "flex",
                flex: 1,
                flexDirection: "column",
                maxHeight: 500,
                overflowY: "auto",
                pr: 2,
                "&::-webkit-scrollbar": {
                  width: 6,
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#ccc",
                  borderRadius: 3,
                },
              }}
            >
              {currentParticipants
                .slice() 
                .sort((a, b) => (a.isHost ? -1 : b.isHost ? 1 : 0))
                .map((participant) => (
                  <Box
                    key={participant.id}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 180px",
                      alignItems: "center",
                      p: 1.5,
                      borderRadius: 1,
                      bgcolor: participant.selected
                        ? "primary.50"
                        : "transparent",
                      "&:hover": {
                        bgcolor: "grey.50",
                      },
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={participant.selected}
                          onChange={() =>
                            handleSelectParticipant(participant.id)
                          }
                          disabled={participant.isHost} // host는 체크 해제 불가
                          size="small"
                        />
                      }
                      label={
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <span>{`${participant.name} ${
                            participant.jobPositionName || ""
                          }`}</span>
                          {participant.isHost && (
                            <span
                              className="ml-2 px-2 py-0.5 text-xs font-bold rounded-sm"
                              style={{
                                backgroundColor: "#FFE0B2",
                                color: "#E65100",
                              }}
                            >
                              주관자
                            </span>
                          )}
                        </Box>
                      }
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={participant.isPermitted}
                          onChange={() =>
                            handleTogglePermission(participant.id)
                          }
                          disabled={participant.isHost} // host는 체크 해제 불가
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
        {isMobile && (
            <Button onClick={handleClose} variant="contained" sx={{ m: 2 }}>확인</Button>
        )}
      </Dialog>
    </>
  );
}
