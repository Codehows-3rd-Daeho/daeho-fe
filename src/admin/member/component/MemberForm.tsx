import {
  Box,
  TextField,
  MenuItem,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputAdornment,
  IconButton,
  Button,
  Input,
  Avatar,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import type { MasterDataType } from "../../setting/type/SettingType";
import type { Member } from "../type/MemberType";

type MemberFormProps = {
  mode: "create" | "update"; // 등록 수정
  member: Member;
  department: MasterDataType[];
  jobPosition: MasterDataType[];
  showPassword?: boolean;
  onTogglePassword?: () => void;
  handleChange: <K extends keyof Member>(field: K, value: Member[K]) => void;
  handleImageChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  profileUrl?: string;
  handleRemoveProfile?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  errors: Record<string, string>;
  validateField: (field: string, value: string) => void;
  isDuplicate: boolean;
  isChecked: boolean;
  onCheckDuplicate: (loginId: string) => Promise<void>;

  // 수정 모달 전용
  onGeneratePwd?: () => Promise<void>; // 임시 비밀번호 생성
};

export default function MemberForm({
  mode,
  member,
  department,
  jobPosition,
  showPassword,
  onTogglePassword,
  handleChange,
  handleImageChange,
  profileUrl,
  handleRemoveProfile,
  errors,
  validateField,
  isDuplicate,
  isChecked,
  onCheckDuplicate,
  onGeneratePwd,
}: MemberFormProps) {
  return (
    <Box
      component="form"
      sx={{
        display: "flex",
        flexDirection: "column",
        width: 400,
        gap: 2,
        mt: 2,
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <Box sx={{ position: "relative", width: 150, height: 200 }}>
          <Avatar
            sx={{ width: "100%", height: "100%", borderRadius: "4px" }}
            src={profileUrl || "/default-profile.png"}
          />
          {profileUrl && (
            <IconButton
              size="small"
              onClick={handleRemoveProfile}
              sx={{
                position: "absolute",
                top: 4,
                right: 4,
                borderRadius: "4px",
                padding: "2px 6px",
                backgroundColor: "rgba(128,128,128,0.6)",
                color: "white",
                "&:hover": { backgroundColor: "rgba(0,0,0,0.8)" },
              }}
            >
              ✕
            </IconButton>
          )}
        </Box>
      </Box>

      {/* 사진 업로드 버튼 */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
        <Input
          inputProps={{ accept: "image/*" }}
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
      </Box>

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
            if (!member.loginId || errors.loginId) return;
            await onCheckDuplicate?.(member.loginId);
          }}
          disabled={!member.loginId || Boolean(errors.loginId)}
        >
          중복확인
        </Button>
      </Box>
      {/* 비밀번호 */}
      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          label="비밀번호"
          type={mode === "update" ? "text" : showPassword ? "text" : "password"}
          variant="outlined"
          fullWidth
          value={member.password ?? ""}
          onChange={(e) => {
            const value = e.target.value;
            handleChange("password", value);
            validateField("password", value);
          }}
          error={Boolean(errors.password)}
          helperText={errors.password}
          slotProps={{
            input: {
              readOnly: mode === "update",
              endAdornment: (
                <InputAdornment position="end">
                  {mode === "create" && (
                    // 등록 페이지 : 눈 아이콘
                    <IconButton onClick={onTogglePassword}>
                      {showPassword ? (
                        <VisibilityOffIcon fontSize="small" />
                      ) : (
                        <VisibilityIcon fontSize="small" />
                      )}
                    </IconButton>
                  )}
                </InputAdornment>
              ),
            },
          }}
        />
        {/* 수정 페이지 : 임시 비밀번호 생성 버튼 */}
        {mode === "update" && (
          <Button size="small" variant="outlined" onClick={onGeneratePwd}>
            임시 비밀번호 생성
          </Button>
        )}
      </Box>
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
          value={member.departmentId ?? ""}
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
          onChange={(e) => handleChange("departmentId", Number(e.target.value))}
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
          value={member.jobPositionId ?? ""}
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
          <FormControlLabel value={true} control={<Radio />} label="재직중" />
          <FormControlLabel value={false} control={<Radio />} label="퇴사" />
        </RadioGroup>
      </FormControl>
    </Box>
  );
}
