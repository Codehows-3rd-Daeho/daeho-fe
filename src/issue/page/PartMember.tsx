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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { IssueMemberDto, PartMemberList } from "../type/type";
import { useAuthStore } from "../../store/useAuthStore";
import {
  getDepartment,
  // getJobPosition,
} from "../../admin/setting/api/MasterDataApi";
import { getPartMemberList } from "../../admin/member/api/MemberApi";

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

//부서랑 직급을 백에서 받아와야됨
type CategoryType = string;

type ParticipantList = {
  [key: string]: Participant[];
};

export default function PartMember({
  onChangeMembers,
  initialMembers,
  mode,
}: PartMemberProps) {
  const [open, setOpen] = useState(false);
  //모달 열기
  const handleOpen = () => setOpen(true);
  //모달 닫기
  const handleClose = () => setOpen(false);

  //분류탭
  const [activeTab, setActiveTab] = useState(0);
  const [categories, setCategories] = useState<CategoryType[]>(["전체"]);
  const [participants, setParticipants] = useState<ParticipantList>({});
  const currentCategory = categories[activeTab]; //선택된 tap(activeTab)에 헤당하는 카테고리 이름을 가져옴
  const currentParticipants = participants[currentCategory] || []; //participants 객체에서 현재 선택된 카테고리(currentCategory)에 속한 참여자 리스트를 가져옴

  // 로그인된 사용자 id
  const { member } = useAuthStore();
  const memberId = member?.memberId;

  // ===============================================================================================
  //                      저장 로직(선택 로직에서 각각 추가)
  // ===============================================================================================

  function handleSave(updatedParticipants: ParticipantList) {
    //최종 부모 컴포넌트로 전달할 배열 생성(중복 제거)
    const selectedParticipants = [
      ...new Map(
        Object.values(updatedParticipants)
          .flat() //평탄화: 중첩된 객체를 1차원으로 풀어내거나 단순하게 만드는 것
          .filter((p) => p.selected || p.id === Number(memberId)) // 선택되었거나 host이면 포함
          .map((p) => [p.id, p]) // key: id / value: participant
      ).values(),
    ];

    //selectedParticipants를 IssueMemberDto 타입으로 변환
    const result: IssueMemberDto[] = selectedParticipants.map((p) => ({
      id: p.id,
      name: p.name,
      jobPositionName: "",
      departmentName: "",
      isHost: p.id === Number(memberId), // 로그인된 멤버면 true
      isPermitted: p.isPermitted,
      isRead: false,
    }));

    onChangeMembers(result); // 부모에게 전달
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        // const positions = await getJobPosition(); // 직급 [{id, name}]
        const departments = await getDepartment(); // 부서 [{id, name}]

        // const positionNames = positions.map((p) => p.name); //직급 배열 -> 분류탭으로 사용
        const departmentNames = departments.map((d) => d.name); //부서 배열 -> 분류탭으로 사용

        // setCategories(["전체", ...positionNames, ...departmentNames]); // 전체 + 직급 + 부서

        //전체, 부서
        setCategories(["전체", ...departmentNames]);

        // 회원 전체 불러오기
        const memberList = await getPartMemberList();

        // 기존 참여자 -> Participant 타입으로 변환
        const initialMap = new Map(
          initialMembers?.map((m) => [
            m.id,
            {
              ...m,
              selected: true, // 기존 참여자는 선택됨
              isPermitted: m.isPermitted,
              isHost: m.isHost,
            },
          ])
        );
        // 받아온 회원 전체를 기본값 추가한 Participant 형태로 변환
        const mapped: Participant[] = memberList.map((m) => {
          const memberIdNum = Number(m.id);
          const isHost = memberIdNum === Number(memberId); //로그인한 사람 체크
          const existingMember = initialMap.get(memberIdNum); // 기존 참여자에 있는지 확인
          return {
            ...m,
            department: m.department,
            position: m.jobPositionName,

            selected:
              mode === "create"
                ? isHost // 등록: 로그인한 사람만 기본 선택
                : isHost || existingMember?.selected || false, // 수정: host + 기존 참여자 유지

            isPermitted: isHost
              ? true
              : existingMember
              ? existingMember.isPermitted // 기존 참여자는 저장된 권한 사용
              : false, // 그 외는 false
            isHost:
              mode === "create"
                ? isHost
                : existingMember
                ? existingMember.isHost
                : false,
            // host 지정
          };
        });

        //이슈 선택시 해당 이슈의 참여자 자동 선택
        // 5) initialMembers 기반으로 selected / isPermitted 설정
        if (initialMembers && initialMembers.length > 0) {
          const initialMemberMap = new Map(
            initialMembers.map((m) => [m.id, m])
          );

          mapped.forEach((p) => {
            if (initialMemberMap.has(p.id)) {
              p.selected = true;
              //권한 추가시 부모 컴포넌트의 수정 권한이 우선적으로 적용되어 전체 권한 선택박스로직에서 빠짐
              // p.isPermitted = initialMemberMap.get(p.id)!.isPermitted;
            }
          });
        }

        // 4) 카테고리별 분류
        const categorized: ParticipantList = {
          전체: mapped,
        };

        // 직급별 분류
        // positionNames.forEach((pos) => {
        //   categorized[pos] = mapped.filter((m) => m.jobPositionName === pos);
        // });

        // 부서별 분류
        departmentNames.forEach((dept) => {
          categorized[dept] = mapped.filter((m) => m.department === dept);
        });

        setParticipants(categorized);
        handleSave(categorized);
      } catch (error) {
        console.error("카테고리/참여자 로딩 실패:", error);
      }
    };

    loadData();
  }, [memberId, initialMembers, mode]);

  // ===============================================================================================
  //                       분류탭
  // ===============================================================================================

  //탭 선택 시 activeTab 값을 바꿔서 카테고리 변경.
  //_event:탭 클릭 시 발생하는 이벤트 객체를 사용하지 않음
  //newValue: 새로 선택된 탭 인덱스
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  //특정 참여자의 selected 상태를 토글
  //id: 클릭한 참여자의 고유 ID
  const handleSelectParticipant = (id: number) => {
    setParticipants((prev) => {
      //얕은 복사: React에서 state를 변경할 때 수정이 아닌 새 객체를 반환해야 UI가 갱신됨.
      const updated = { ...prev };
      /*
      하나의 참여자가 여러 카테고리에 속할 수 있음 => updated 객체의 모든 카테고리(전체, 직급명, 부서명)를 순회 
      Object.keys(updated): 각 카테고리 배열을 하나씩 확인
      ex) updated["전체"] = [ { id: 1, name: "A", selected: true }] 라는 새 배열 생성
      => 분류 탭을 바꿔도 클릭 상태 유지
       */
      Object.keys(updated).forEach((key) => {
        updated[key] = updated[key].map((p) => {
          if (p.id !== id) return p;

          const nextSelected = !p.selected;

          return {
            ...p,
            selected: nextSelected,
            isPermitted: nextSelected ? p.isPermitted : false,
          };
        });
      });
      handleSave(updated);
      return updated;
    });
  };

  // ===============================================================================================
  //                        참여 선택
  // ===============================================================================================

  //선택된 tab 내의 전체 회원 선택(체크박스용)
  const allSelected =
    currentParticipants.length > 0 &&
    currentParticipants.every((p) => p.selected);

  //참여자 전체 선택 핸들러
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;

    setParticipants((prev) => {
      const updated = { ...prev };

      Object.keys(updated).forEach((key) => {
        updated[key] = updated[key].map((p) => ({
          ...p,
          selected: p.isHost ? true : checked, //주관자는 고정
        }));
      });
      handleSave(updated);
      return updated;
    });
  };

  // 선택된 사람 수 계산
  //ID 기준으로 중복 제거 후 갯수 세기
  const selectedCount = [
    ...new Map(
      Object.values(participants)
        .flat()
        .filter((p) => p.selected)
        .map((p) => [p.id, p]) // key: id / value: participant
    ).values(),
  ].length;

  // ===============================================================================================
  //                        수정 권한 선택
  // ===============================================================================================

  //선택된 tab 내의 전체 회원 수정 권한 부여(체크박스용)
  const allHavePermission =
    currentParticipants.length > 0 &&
    currentParticipants.every((p) => p.isPermitted);

  //권한 전체 선택 핸들러
  const handleSelectAllPermissions = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checked = event.target.checked;

    setParticipants((prev) => {
      const updated = { ...prev };

      Object.keys(updated).forEach((key) => {
        updated[key] = updated[key].map((p) => {
          if (p.isHost) {
            return {
              ...p,
              isPermitted: true, // host 고정
              selected: true,
            };
          }

          return {
            ...p,
            isPermitted: checked,
            selected: checked || p.selected,
          };
        });
      });
      handleSave(updated);
      return updated;
    });
  };

  //특정 참여자의 특정 참여자의 isPermitted 상태 토글.
  const handleTogglePermission = (id: number) => {
    setParticipants((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((key) => {
        updated[key] = updated[key].map((p) =>
          p.id === id
            ? { ...p, isPermitted: !p.isPermitted, selected: true }
            : p
        );
      });
      handleSave(updated);
      return updated;
    });
  };

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
        참여자 추가 ({selectedCount} 명)
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        PaperProps={{
          sx: { height: "600px", maxHeight: "90vh", width: "750px" },
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
              minWidth: 200,
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

          {/* 오른쪽 컨텐츠 */}
          <DialogContent sx={{ flex: 1, overflow: "hidden" }}>
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
                flexDirection: "column",
                maxHeight: 420,
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
                .slice() // 원본 보호용
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
      </Dialog>
    </>
  );
}
