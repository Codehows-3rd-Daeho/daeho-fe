import { AppBar, Toolbar, IconButton, Typography, Box } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import type { HeaderProps } from "./type";
import NotificationDropdown from "../../webpush/page/NotificationDropdown";

export default function Header({ name, jobPosition }: HeaderProps) {
  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: "#fff",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <Toolbar sx={{ justifyContent: "flex-end", gap: 2 }}>
        <NotificationDropdown />

        {/* 2️⃣ 이름 + 직책 */}
        <Box
          display="inline-flex" // inline-flex로 텍스트 길이에 맞게 가로 늘어나게
          alignItems="center"
          sx={{
            height: "auto", // 높이는 텍스트 패딩에 맞게
            border: "1px solid #ccc",
            borderRadius: 5,
            px: 2, // 좌우 패딩
            py: 0.5, // 상하 패딩
            backgroundColor: "#f5f5f5",
            gap: 0.5,
            minWidth: 50, // 최소 너비 지정 가능
          }}
        >
          <Typography
            variant="body2"
            color="text.primary"
            sx={{ whiteSpace: "nowrap" }} // 줄바꿈 없이 한 줄
          >
            {name}
          </Typography>
          <Typography
            variant="body2"
            color="text.primary"
            sx={{ whiteSpace: "nowrap" }}
          >
            {jobPosition}
          </Typography>
        </Box>

        {/* 3️⃣ 마이페이지 아이콘 */}
        <IconButton
          sx={{ color: "#333" }}
          onClick={() => (window.location.href = "/mypage")}
        >
          <AccountCircleIcon fontSize="large" />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
