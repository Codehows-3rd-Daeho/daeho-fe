import { useEffect, useState } from "react";
import type { Member } from "../type/MemberType";
import type { MasterDataType } from "../../setting/type/SettingType";
import { getDepartment, getJobPosition } from "../../setting/api/MasterDataApi";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MemberForm from "./MemberForm";
import {
  checkId,
  generatePwd,
  getMemberDtl,
  updateMember,
} from "../api/MemberApi";
import axios from "axios";
import { BASE_URL } from "../../../config/httpClient";

type UpdateMemberModalProps = {
  open: boolean; // 모달이 열려있는지, 닫혀있는지
  onClose: () => void; // 모달을 닫을 때 호출되는 함수
  loadData: () => void; // 데이터 새로고침
  memberId: number; // 조회할 회원 ID
};

export default function UpdateMemberModal({
  open,
  onClose,
  loadData,
  memberId,
}: UpdateMemberModalProps) {
  const [member, setMember] = useState<Member>({
    loginId: "",
    password: "",
    name: "",
    phone: "",
    email: "",
    departmentId: "",
    jobPositionId: "",
    isEmployed: true,
  });

  const [department, setDepartment] = useState<MasterDataType[]>([]);
  const [jobPosition, setJobPosition] = useState<MasterDataType[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [originalLoginId, setOriginalLoginId] = useState(""); // 기존 아이디
  const [profileFile, setProfileFile] = useState<File | null>(null); // 새로 업로드할 파일
  const [profileFileId, setProfileFileId] = useState<number | null>(null); // 기존 서버 파일 id
  const [removeFileIds, setRemoveFileIds] = useState<number[]>([]); // 삭제한 파일 id
  const [profileUrl, setProfileUrl] = useState<string>(""); // 미리보기용

  // 부서 직급 가져오기
  useEffect(() => {
    if (open) {
      async function fetchData() {
        try {
          const dept = await getDepartment(); // 부서
          const pos = await getJobPosition(); // 직급
          const memberData = await getMemberDtl(memberId); // 회원

          setDepartment(dept);
          setJobPosition(pos);
          setMember(memberData);
          setOriginalLoginId(memberData.loginId); // 기존 아이디 저장.
          setProfileFileId(memberData.profileFileId ?? null);
          console.log(memberData.profileFileId);
          // 사진 URL 설정
          setProfileUrl(
            memberData.profileUrl ? `${BASE_URL}${memberData.profileUrl}` : ""
          );
        } catch (error) {
          console.log("데이터를 불러오는 중 오류 발생", error);
        }
      }
      fetchData();
    }
  }, [open, memberId]); // 모달이 열릴 때만 호출

  const handleChange = <K extends keyof Member>(field: K, value: Member[K]) => {
    setMember((prev) => ({ ...prev, [field]: value })); //기존 member 상태를 유지하면서, 지정한 필드만 업데이트
    if (field === "loginId") {
      setIsDuplicate(false);
      setIsChecked(false);
    }
  };

  const validateField = (field: string, value: string) => {
    let errorMsg = "";

    // 값이 비어있을 경우, 유효성 검사(형식 검사)를 건너뛰고 에러 메시지를 초기화
    if (value.trim() === "") {
      setErrors((prev) => ({ ...prev, [field]: "" }));
      return "";
    }

    switch (field) {
      case "loginId":
        if (!/^[A-Za-z0-9]{4,20}$/.test(value)) {
          errorMsg = "영문 또는 숫자 4~20자로 입력하세요.";
        }
        break;

      case "phone":
        if (!/^[0-9-]+$/.test(value)) {
          errorMsg = "숫자와 하이픈(-)만 입력 가능합니다.";
        }
        // 하이픈(-) 포함
        else if (!value.includes("-")) {
          errorMsg = "하이픈(-)을 포함해주세요.";
        }
        break;

      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errorMsg = "올바른 이메일 형식이 아닙니다.";
        }
        break;

      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: errorMsg }));
    return errorMsg;
  };

  const handleCheckDuplicate = async (loginId: string) => {
    if (!loginId) return;

    // 기존 아이디랑 같으면 중복 체크 x
    if (loginId === originalLoginId) {
      setIsDuplicate(false);
      setIsChecked(true);
      return;
    }
    try {
      const result = await checkId(loginId);
      setIsDuplicate(result.exists);
      setIsChecked(true);
    } catch (err) {
      console.error(err);
      setIsDuplicate(false);
      setIsChecked(true);
    }
  };

  const onGeneratePwd = async () => {
    try {
      const response = await generatePwd(memberId);
      const newPwd = response.newPassword;
      handleChange("password", newPwd); // 비밀번호 입력창에 들어감
      alert(`임시 비밀번호가 생성되었습니다.\n새 비밀번호: ${newPwd}`);
    } catch (error) {
      console.error("임시 비밀번호 생성 중 오류:", error);
      alert("임시 비밀번호 생성에 실패했습니다.");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return; // 파일이 선택되지 않았으면 아무 것도 하지 않고 함수 종료

    // 기존 파일이 있고, 아직 removeFileIds에 없으면 추가
    if (profileFileId !== null && !removeFileIds.includes(profileFileId)) {
      setRemoveFileIds((prev) => [...prev, profileFileId]);
    }

    setProfileFileId(null); // 기존 파일 삭제 표시
    setProfileFile(file);
    setProfileUrl(URL.createObjectURL(file)); // 미리보기
  };

  const handleRemoveProfile = () => {
    if (profileFileId !== null) {
      setRemoveFileIds((prev) => [...prev, profileFileId]); // 삭제할 ID 저장
    }
    setProfileFile(null); // 업로드된 파일 제거
    setProfileFileId(null); // 기존 파일 삭제 표시
    setProfileUrl(""); // 미리보기 제거
  };

  const handleSubmit = async () => {
    if (member.loginId !== originalLoginId) {
      if (!isChecked) return alert("아이디 중복 확인을 완료해주세요.");
      if (isDuplicate) return alert("이미 사용 중인 아이디입니다.");
    }

    // 각 필드 유효성 검사
    validateField("loginId", member.loginId);
    validateField("phone", member.phone);
    validateField("email", member.email);

    // 필수 필드 배열
    const requiredFields: (keyof Member)[] = [
      "loginId",
      "name",
      "phone",
      "email",
    ];

    // 필수 필드가 비어있는지 확인
    const hasEmptyRequiredFields = requiredFields.some(
      (field) => !member[field]
    );

    // 에러가 있는지 확인
    const hasErrors = Object.values(errors).some((e) => e !== "");

    if (hasErrors || hasEmptyRequiredFields) {
      alert("모든 항목을 올바르게 입력해주세요.");
      return;
    }
    try {
      const formData = new FormData();

      // member객체 → JSON → Blob → "data" 라는 키로 넣기
      const jsonBlob = new Blob([JSON.stringify(member)], {
        type: "application/json",
      });
      formData.append("data", jsonBlob);

      // 이미지 파일
      if (profileFile) {
        formData.append("file", profileFile);
      }

      // 기존 파일 삭제
      if (removeFileIds.length > 0) {
        formData.append("removeFileIds", JSON.stringify(removeFileIds));
      }

      for (const [key, value] of formData.entries()) {
        console.log(key, value);
      }
      await updateMember(memberId, formData);
      await loadData();
      alert("회원 수정 완료");
      handleClose();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return;
      }
      console.error("회원 수정 중 오류 발생:", error);
      alert("회원 수정 중 오류가 발생했습니다.");
    }
  };

  const handleClose = () => {
    setMember({
      loginId: "",
      password: "",
      name: "",
      phone: "",
      email: "",
      departmentId: "",
      jobPositionId: "",
      isEmployed: true,
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm">
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        회원 수정
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <MemberForm
          mode="update"
          member={member}
          department={department}
          jobPosition={jobPosition}
          handleChange={handleChange}
          handleImageChange={handleImageChange}
          handleRemoveProfile={handleRemoveProfile}
          profileUrl={profileUrl}
          errors={errors}
          validateField={validateField}
          isDuplicate={isDuplicate}
          isChecked={isChecked}
          onCheckDuplicate={handleCheckDuplicate}
          onGeneratePwd={onGeneratePwd}
        />
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={handleSubmit}>
          수정
        </Button>
      </DialogActions>
    </Dialog>
  );
}
