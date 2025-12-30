import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  Avatar,
  TextField,
  Button,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  changePassword,
  getMemberProfile,
} from "../admin/member/api/MemberApi";
import { useAuthStore } from "../store/useAuthStore";
import type { MemberProfile } from "../admin/member/type/MemberType";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { BASE_URL, type ApiError } from "../config/httpClient";

interface InfoRowProps {
  label: string;
  value?: string;
  type?: "text" | "password";
  isText?: boolean;
  onChange?: (value: string) => void;
  error?: boolean;
  helperText?: string;
  showPassword?: boolean;
  onToggleShowPassword?: () => void;
}

export default function MyPage() {
  const { member } = useAuthStore();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);

  //비밀번호 재설정
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  //비밀번호 보기 아이
  const [showPassword, setShowPassword] = useState(false);

  //비밀번호 일치 확인
  const isPasswordMismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword;

  //비밀번호 8자 확인
  const isPasswordTooShort = newPassword.length > 0 && newPassword.length < 8;

  useEffect(() => {
    if (!member?.memberId) return;

    getMemberProfile(member.memberId)
      .then(setProfile)
      .finally(() => setLoading(false));
  }, [member?.memberId]);

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 5 }}>
        <Typography>로딩 중...</Typography>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container maxWidth="sm" sx={{ mt: 5 }}>
        <Typography>회원 정보를 불러올 수 없습니다.</Typography>
      </Container>
    );
  }
  const handlePasswordSave = async () => {
    if (newPassword.length < 8) {
      alert("비밀번호는 최소 8자 이상이어야 합니다.");
      return;
    }

    if (newPassword !== confirmPassword) {
      return;
    }

    try {
      await changePassword(newPassword);
      alert("비밀번호가 변경되었습니다.");

      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      const apiError = error as ApiError;
      const response = apiError.response?.data?.message;
      alert(response ?? "오류가 발생했습니다.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5, mb: 5 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 4 }}>
        마이페이지
      </Typography>

      {/* 프로필 이미지 */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 6 }}>
        <Avatar
          src={profile.profileUrl ? `${BASE_URL}${profile.profileUrl}` : ""}
          sx={{ width: 150, height: 150 }}
        />
      </Box>

      {/* 정보 필드 */}
      <Box sx={{ px: 2, py: 4 }}>
        <InfoRow label="아이디" value={profile.loginId} isText />
        {/* 비밀번호 변경 영역 */}
        <InfoRow
          label="새 비밀번호"
          type={showPassword ? "text" : "password"}
          value={newPassword}
          onChange={setNewPassword}
          error={isPasswordTooShort}
          helperText={
            isPasswordTooShort ? "비밀번호는 8자 이상이어야 합니다." : undefined
          }
          showPassword={showPassword}
          onToggleShowPassword={() => setShowPassword((prev) => !prev)}
        />

        <InfoRow
          label="비밀번호 확인"
          type={showPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={setConfirmPassword}
          error={isPasswordMismatch}
          helperText={
            isPasswordMismatch ? "비밀번호가 일치하지 않습니다." : undefined
          }
          showPassword={showPassword}
          onToggleShowPassword={() => setShowPassword((prev) => !prev)}
        />

        <InfoRow label="이름" value={profile.name} isText />
        <InfoRow label="이메일" value={profile.email} isText />
        <InfoRow label="전화번호" value={profile.phone} isText />
        <InfoRow label="부서" value={profile.departmentName} isText />
        <InfoRow label="직급" value={profile.jobPositionName} isText />
      </Box>

      {/* 버튼 */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
        <Button
          variant="contained"
          onClick={handlePasswordSave}
          disabled={isPasswordMismatch}
        >
          비밀번호 저장
        </Button>
      </Box>
    </Container>
  );
}

/* ---------------- InfoRow ---------------- */

const InfoRow: React.FC<InfoRowProps> = ({
  label,
  value,
  type = "text",
  isText = false,
  onChange,
  error,
  helperText,
  showPassword,
  onToggleShowPassword,
}) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", m: 5 }}>
      {/* 라벨 */}
      <Box sx={{ width: "33%" }}>
        <Typography variant="body1" fontWeight="medium">
          {label}
        </Typography>
      </Box>

      {/* 값 */}
      <Box sx={{ flexGrow: 1 }}>
        {isText ? (
          <Typography variant="body1">{value}</Typography>
        ) : (
          <TextField
            fullWidth
            type={type}
            size="small"
            variant="outlined"
            value={value ?? ""}
            error={error}
            helperText={helperText}
            onChange={(e) => onChange?.(e.target.value)}
            InputProps={
              type === "password" || type === "text"
                ? {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={onToggleShowPassword}>
                          {showPassword ? (
                            <VisibilityOffIcon fontSize="small" />
                          ) : (
                            <VisibilityIcon fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }
                : undefined
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "15px",
                backgroundColor: "#f0f0f0",
              },
            }}
          />
        )}
      </Box>
    </Box>
  );
};
