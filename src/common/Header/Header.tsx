import { AppBar, Toolbar, IconButton, Typography, Box } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import type { HeaderProps } from "./type";
import NotificationDropdown from "../../webpush/page/NotificationDropdown";
import { useEffect, useState } from "react";
import { getUnreadNotificationCount } from "../../webpush/api/notificationApi";
import type { ApiError } from "../../config/httpClient";

export default function Header({ name, jobPosition }: HeaderProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const count = await getUnreadNotificationCount();
        setUnreadCount(count);
      } catch (error) {
        const apiError = error as ApiError;
        const response = apiError.response?.data?.message;

        alert(response ?? "알림 조회 중 오류가 발생했습니다.");
      }
    };

    fetchUnreadCount();
  }, []);

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: "#fff",
        boxShadow: "none",
      }}
    >
      <Toolbar sx={{ justifyContent: "flex-end", gap: 2 }}>
        {/* 알림 */}
        <NotificationDropdown
          unreadCount={unreadCount}
          onReadNotification={() => setUnreadCount((prev) => prev - 1)}
        />

        {/* 이름 + 직책 */}
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
        {/* 마이페이지 아이콘 */}
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
