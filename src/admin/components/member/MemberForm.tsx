import {
  Box,
  TextField,
  Button,
  IconButton,
  MenuItem,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import type { Member } from "../../type/MemberType";
import type { MasterDataType } from "../../type/SettingType";

interface MemberFormProps {
  member: Member;
  department: MasterDataType[];
  jobPosition: MasterDataType[];
  onChange: <K extends keyof Member>(field: K, value: Member[K]) => void;
  onSubmit: () => void;
  errors: { [key: string]: string };
  isDuplicate: boolean;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  validateField: (field: string, value: string) => void;
}

export default function MemberForm({
  member,
  department,
  jobPosition,
  onChange,
  onSubmit,
  errors,
  isDuplicate,
  showPassword,
  setShowPassword,
  validateField,
}: MemberFormProps) {
  return (
    <Box
      component="form"
      sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
    >
      {/* 아이디 & 비밀번호 */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <TextField
          label="아이디"
          variant="outlined"
          fullWidth
          value={member.loginId}
          onChange={(e) => {
            const value = e.target.value;
            onChange("loginId", value);
            validateField("loginId", value);
          }}
          error={isDuplicate || Boolean(errors.loginId)}
          helperText={
            member.loginId === ""
              ? ""
              : errors.loginId
              ? errors.loginId
              : isDuplicate
              ? "이미 사용 중인 아이디입니다."
              : "사용 가능한 아이디입니다."
          }
          slotProps={{
            formHelperText: {
              sx: {
                color:
                  isDuplicate || errors.loginId
                    ? "red"
                    : member.loginId === ""
                    ? "inherit"
                    : "green",
                fontWeight: 500,
              },
            },
          }}
        />
        <TextField
          label="비밀번호"
          type={showPassword ? "text" : "password"}
          variant="outlined"
          fullWidth
          value={member.password}
          onChange={(e) => {
            const value = e.target.value;
            onChange("password", value);
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
                      <VisibilityOff fontSize="small" />
                    ) : (
                      <Visibility fontSize="small" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {/* 이름 & 전화번호 */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <TextField
          label="이름"
          variant="outlined"
          fullWidth
          value={member.name}
          onChange={(e) => onChange("name", e.target.value)}
        />
        <TextField
          label="전화번호"
          variant="outlined"
          fullWidth
          value={member.phone}
          onChange={(e) => {
            const value = e.target.value;
            onChange("phone", value);
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
          value={member.departmentId}
          onChange={(e) => onChange("departmentId", e.target.value)}
        >
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
          value={member.jobPositionId}
          onChange={(e) => onChange("jobPositionId", e.target.value)}
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
          onChange("email", value);
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
          onChange={(e) => onChange("isEmployed", e.target.value === "true")}
        >
          <FormControlLabel value={true} control={<Radio />} label="재직중" />
          <FormControlLabel value={false} control={<Radio />} label="퇴사" />
        </RadioGroup>
      </FormControl>

      <Button variant="contained" color="primary" onClick={onSubmit}>
        등록
      </Button>
    </Box>
  );
}
