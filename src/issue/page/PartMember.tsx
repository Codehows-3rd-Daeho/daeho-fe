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
import { useAuthStore } from "../../store/useAuthStore";
import {
  getDepartment,
  // getJobPosition,
} from "../../admin/setting/api/MasterDataApi";
import { getPartMemberList } from "../../admin/member/api/MemberApi";

interface Participant extends PartMemberList {
  selected: boolean;
  isPermitted: boolean;
}
interface PartMemberProps {
  onChangeMembers: (members: IssueMemberDto[]) => void;
  initialMembers: IssueMemberDto[]; // 이슈 선택시 넘어올 참여자들
}

//부서랑 직급을 백에서 받아와야됨
type CategoryType = string;

type ParticipantList = {
  [key: string]: Participant[];
};

export default function PartMember({
  onChangeMembers,
  initialMembers,
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

        // 받아온 회원 전체를 기본값 추가한 Participant 형태로 변환
        const mapped: Participant[] = memberList.map((m) => ({
          ...m,
          department: m.department, //department(name)을 department 매핑
          position: m.jobPositionName, //JobPositionName을 position으로 매핑
          selected: m.id === Number(memberId), // 작성자는 자동 선택
          isPermitted: m.id === Number(memberId), // 작성자는 권한도 자동 체크
        }));

        //이슈 선택시 해당 이슈의 참여자 자동 선택
        // 5) initialMembers 기반으로 selected / isPermitted 설정
        if (initialMembers && initialMembers.length > 0) {
          const initialMemberMap = new Map(
            initialMembers.map((m) => [m.memberId, m])
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
      } catch (error) {
        console.error("카테고리/참여자 로딩 실패:", error);
      }
    };

    loadData();
  }, [initialMembers]);

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
        updated[key] = updated[key].map(
          (p) => (p.id === id ? { ...p, selected: !p.selected } : p) //클릭한 참여자(id)라면: selected 값을 현재 상태의 반대로 토글 (true → false, false → true)
        );
      });
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
          selected: checked,
        }));
      });

      return updated;
    });
  };

  //특정 참여자의 특정 참여자의 isPermitted 상태 토글.
  const handleTogglePermission = (id: number) => {
    setParticipants((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((key) => {
        updated[key] = updated[key].map((p) =>
          p.id === id ? { ...p, isPermitted: !p.isPermitted } : p
        );
      });
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
        updated[key] = updated[key].map((p) => ({
          ...p,
          isPermitted: checked,
        }));
      });

      return updated;
    });
  };

  // ===============================================================================================
  //                      저장
  // ===============================================================================================

  const handleSave = () => {
    //최종 부모 컴포넌트로 전달할 배열 생성
    const selectedParticipants = Object.values(participants)
      .flat() //평탄화: 중첩된 객체를 1차원으로 풀어내거나 단순하게 만드는 것
      .filter((p) => p.selected || p.id === memberId); // 선택되었거나 host이면 포함

    //selectedParticipants를 IssueMemberDto 타입으로 변환
    const result: IssueMemberDto[] = selectedParticipants.map((p) => ({
      memberId: p.id,
      memberName: p.name,
      isHost: p.id === Number(memberId), // 로그인된 멤버면 true
      isPermitted: p.isPermitted,
      isRead: false,
    }));

    onChangeMembers(result); // 부모에게 전달
    handleClose();
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
                label="권한 전체선택"
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
                        disabled={participant.id === Number(memberId)} // 🔥 주관자 선택 해제 불가
                        size="small"
                      />
                    }
                    label={`${participant.name} ${participant.jobPositionName}`}
                    sx={{ minWidth: 160 }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={participant.isPermitted}
                        onChange={() => handleTogglePermission(participant.id)}
                        disabled={participant.id === Number(memberId)} // 🔥 주관자 선택 해제 불가
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
