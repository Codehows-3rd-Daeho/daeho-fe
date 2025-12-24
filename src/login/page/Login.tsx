import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { loginAndGetToken } from "../api/LoginApi";
import axios from "axios";

export default function Login() {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleLogin = async () => {
    setError("");

    // 1. 클라이언트 입력 검증
    if (!loginId) {
      setError("아이디를 입력해주세요.");
      return;
    }
    if (!password) {
      setError("비밀번호를 입력해주세요.");
      return;
    }
    if (password.length < 8) {
      setError("비밀번호는 최소 8자 이상이어야 합니다.");
      return;
    }

    try {
      const res = await loginAndGetToken({ loginId, password });

      if (!res) {
        setError("아이디 또는 비밀번호가 올바르지 않습니다.");
        return;
      }
      // 토큰 + 유저정보 store 저장
      login(res.token, {
        memberId: res.memberId,
        name: res.name,
        jobPosition: res.jobPosition,
        role: res.role,
      });

      navigate("/issue/create");
    } catch (error: unknown) {
      //퇴사 메세지
      let message = "아이디 또는 비밀번호가 올바르지 않습니다.";

      if (axios.isAxiosError(error)) {
        message =
          (error.response?.data as { message?: string })?.message ?? message;
      }

      setError(message);
      alert(message);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLogin();
    }
  };

  return (
    <Paper sx={{ p: 4, width: 380, textAlign: "center" }}>
      <Box
        sx={{
          mb: 5,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <img
          src="/daehologo.gif"
          alt="로고"
          style={{ width: 244, height: 50, display: "block" }}
        />
      </Box>

      <TextField
        label="아이디"
        variant="outlined"
        fullWidth
        sx={{ mb: 2 }}
        value={loginId}
        onKeyDown={handleKeyDown}
        onChange={(e) => setLoginId(e.target.value)}
      />
      <TextField
        label="비밀번호"
        type={showPassword ? "text" : "password"}
        variant="outlined"
        fullWidth
        sx={{ mb: 2 }}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={handleKeyDown}
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

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleLogin}
      >
        로그인
      </Button>
      <Typography
        sx={{ mt: 2, fontSize: "0.875rem", color: "#888" }}
        variant="body2"
      >
        로그인 실패 시 관리자에게 문의해 주세요.
      </Typography>
    </Paper>
  );
}
