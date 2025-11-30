import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  MenuItem,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useEffect, useState } from "react";
import { checkId, createMember } from "../../api/MemberApi";
import { getDepartment, getJobPosition } from "../../api/MasterDataApi";
import type { Member } from "../../type/MemberType";
import type { MasterDataType } from "../../type/SettingType";

interface ModalProps {
  open: boolean; // 모달이 열려있는지, 닫혀있는지
  onClose: () => void; // 모달을 닫을 때 호출되는 함수
}

export default function MemberModal({ open, onClose }: ModalProps) {
  const [department, setDepartment] = useState<MasterDataType[]>([]);
  const [jobPosition, setJobPosition] = useState<MasterDataType[]>([]);
  const [showPassword, setShowPassword] = useState(false); // 비밀번호 숨기기
  const [isDuplicate, setIsDuplicate] = useState(false); // 아이디 중복여부
  const [isChecked, setIsChecked] = useState(false); // 중복 검사 버튼 클릭

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

  // 부서 직급 가져오기
  useEffect(() => {
    if (open) {
      async function fetchData() {
        try {
          const dep = await getDepartment();
          const pos = await getJobPosition();
          setDepartment(dep); // 부서 데이터 저장
          setJobPosition(pos); // 직급 데이터 저장
        } catch (error) {
          console.log("데이터를 불러오는 중 오류 발생", error);
        }
      }
      fetchData();
    }
  }, [open]); // 모달이 열릴 때만 호출

  // 로그인 아이디 중복 확인
  const checkDuplicate = async (loginId: string) => {
    if (!loginId) return; // 빈 값이면 체크하지 않음
    try {
      const data = await checkId(loginId);
      // 중복이면 true
      setIsDuplicate(data.exists);
    } catch (error) {
      console.log("아이디 중복 확인 중 오류 발생: ", error);
      setIsDuplicate(false);
    }
  };

  /**
   * Member 객체의 특정 필드를 업데이트하는 함수
   *
   * @template K - Member 타입의 키 중 하나여야 함.
   * @param {K} field - 업데이트할 필드 이름 (Member의 키)
   * @param {Member[K]} value - 해당 필드에 넣을 값
   *
   * 사용 예시:
   * handleChange("name", "홍길동");          // name 필드 업데이트
   */
  const handleChange = <K extends keyof Member>(field: K, value: Member[K]) => {
    setMember((prev) => ({ ...prev, [field]: value })); //기존 member 상태를 유지하면서, 지정한 필드만 업데이트
  };

  // 에러 상태
  const [errors, setErrors] = useState({
    loginId: "",
    password: "",
    phone: "",
    email: "",
  });

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

      case "password":
        if (!/^[^\sㄱ-ㅎ가-힣]{8,20}$/.test(value)) {
          errorMsg = "8~20자로 입력하세요.";
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

  // 등록 버튼 클릭 시
  const handleSubmit = async () => {
    if (!isChecked) {
      alert("아이디 중복 확인을 완료해주세요.");
      return;
    }
    if (isDuplicate) {
      alert("이미 사용 중인 아이디입니다.");
      return;
    }

    // 각 필드 유효성 검사
    validateField("loginId", member.loginId);
    validateField("password", member.password);
    validateField("phone", member.phone);
    validateField("email", member.email);

    // 필수 필드 배열
    const requiredFields: (keyof Member)[] = [
      "loginId",
      "password",
      "name",
      "phone",
      "email",
      "departmentId",
      "jobPositionId",
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
      const response = await createMember(member);
      console.log("회원가입 성공:", response.data);
      alert("회원 등록 성공");
      handleClose(); // 성공하면 모달 닫기
    } catch (error) {
      console.error("회원 등록 중 오류 발생:", error);
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

    // 에러 메시지도 초기화하면 더 좋음
    setErrors({
      loginId: "",
      password: "",
      phone: "",
      email: "",
    });

    // 중복 체크 상태도 초기화
    setIsDuplicate(false);

    onClose(); // 부모 컴포넌트에서 모달 닫기
  };

  // // 프로필 이미지 업로드
  // const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   if (file) {
  //     // createObjectURL을 사용하여 임시 URL 생성
  //     const imageUrl = URL.createObjectURL(file);
  //     handleChange("profileImage", imageUrl);
  //   }
  // };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        회원 등록
        <IconButton aria-label="close" onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box
          component="form"
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
        >
          {/* 프로필 사진
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Avatar
              sx={{ width: 150, height: 200, borderRadius: "4px" }}
              src={member.profileImage || "/default-profile.png"} // 기본 이미지 추가
            />
          </Box>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
            <Input
              accept="image/*"
              type="file"
              onChange={handleImageChange}
              sx={{ display: "none" }}
              id="upload-photo"
            />
            <label htmlFor="upload-photo">
              <Button variant="outlined" component="span">
                프로필 사진 업로드
              </Button>
            </label>
          </Box> */}
          {/* 아이디 + 중복확인 버튼 */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              label="아이디"
              variant="outlined"
              fullWidth
              value={member.loginId}
              onChange={(e) => {
                const value = e.target.value;
                handleChange("loginId", value);
                validateField("loginId", value);
                setIsDuplicate(false); // 입력 시 중복 초기화
                setIsChecked(false); // 입력하면 검사 초기화
              }}
              error={isDuplicate || Boolean(errors.loginId)}
              helperText={
                member.loginId === ""
                  ? ""
                  : errors.loginId
                  ? errors.loginId
                  : isChecked
                  ? isDuplicate
                    ? "이미 사용 중인 아이디입니다."
                    : "사용 가능한 아이디입니다."
                  : ""
              }
              slotProps={{
                formHelperText: {
                  sx: {
                    color:
                      isDuplicate || errors.loginId
                        ? "red"
                        : member.loginId === "" || !isChecked
                        ? "inherit"
                        : "green",
                    fontWeight: 500,
                  },
                },
              }}
            />

            {/* 중복 확인 버튼 */}
            <Button
              variant="outlined"
              color="primary"
              sx={{ whiteSpace: "nowrap", width: "120px", height: "56px" }}
              onClick={async () => {
                if (!member.loginId || errors.loginId) {
                  setErrors((prev) => ({
                    ...prev,
                    loginId: "영문 또는 숫자 4~20자로 입력하세요.",
                  }));
                  return;
                }
                await checkDuplicate(member.loginId);
                setIsChecked(true); // 검사 완료 표시
              }}
            >
              중복확인
            </Button>
          </Box>

          {/* 비밀번호 */}
          <TextField
            label="비밀번호"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            fullWidth
            value={member.password}
            onChange={(e) => {
              const value = e.target.value;
              handleChange("password", value);
              validateField("password", value);
            }}
            error={Boolean(errors.password)}
            helperText={errors.password}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <VisibilityOffIcon fontSize="small" />
                      ) : (
                        <VisibilityIcon fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          {/* 이름 & 전화번호 */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="이름"
              variant="outlined"
              fullWidth
              value={member.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            <TextField
              label="전화번호"
              variant="outlined"
              fullWidth
              value={member.phone}
              onChange={(e) => {
                const value = e.target.value;
                handleChange("phone", value);
                validateField("phone", value);
              }}
              error={Boolean(errors.phone)}
              helperText={errors.phone}
            />
          </Box>
          {/* 부서 & 직급 */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              select
              label="부서"
              variant="outlined"
              fullWidth
              defaultValue=""
              slotProps={{
                select: {
                  MenuProps: {
                    PaperProps: {
                      sx: {
                        maxHeight: 230, // 스크롤
                      },
                    },
                  },
                },
              }}
              onChange={(e) =>
                handleChange("departmentId", Number(e.target.value))
              }
            >
              {/* 선택되는건 value. id이다. */}
              {department.map((dpt) => (
                <MenuItem key={dpt.id} value={dpt.id}>
                  {dpt.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="직급"
              variant="outlined"
              fullWidth
              defaultValue=""
              slotProps={{
                select: {
                  MenuProps: {
                    PaperProps: {
                      sx: {
                        maxHeight: 230,
                      },
                    },
                  },
                },
              }}
              onChange={(e) =>
                handleChange("jobPositionId", Number(e.target.value))
              }
            >
              {jobPosition.map((pos) => (
                <MenuItem key={pos.id} value={pos.id}>
                  {pos.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <TextField
            label="이메일"
            variant="outlined"
            fullWidth
            value={member.email}
            onChange={(e) => {
              const value = e.target.value;
              handleChange("email", value);
              validateField("email", value);
            }}
            error={Boolean(errors.email)}
            helperText={errors.email}
          />
          {/* 재직여부 */}
          <FormControl>
            <FormLabel>재직여부</FormLabel>
            <RadioGroup
              row
              value={member.isEmployed ? "true" : "false"}
              onChange={(e) =>
                handleChange("isEmployed", e.target.value === "true")
              }
            >
              <FormControlLabel
                value={true}
                control={<Radio />}
                label="재직중"
              />
              <FormControlLabel
                value={false}
                control={<Radio />}
                label="퇴사"
              />
            </RadioGroup>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          등록
        </Button>
      </DialogActions>
    </Dialog>
  );
}
