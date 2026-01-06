import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MicIcon from "@mui/icons-material/Mic";
import type { HeaderProps } from "./type";
import NotificationDropdown from "../../webpush/page/NotificationDropdown";
import { useEffect, useState } from "react";
import { getUnreadNotificationCount } from "../../webpush/api/notificationApi";
import useRecordingStore from "../../store/useRecordingStore";
import { useNavigate } from "react-router-dom";
import { BASE_URL, type ApiError } from "../../config/httpClient";
import MenuIcon from "@mui/icons-material/Menu";

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
};

const RecordingIndicator = () => {
  const { getActiveRecordingDetails } = useRecordingStore();
  const activeRecording = getActiveRecordingDetails();
  const navigate = useNavigate();

  if (!activeRecording) {
    return null;
  }

  const { recordingTime, recordingStatus, meetingId } = activeRecording;

  const handleClick = () => {
    if (meetingId) {
      navigate(`/meeting/${meetingId}`, { state: { openSttTab: true } });
    }
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 1,
        backgroundColor: "rgba(255, 0, 0, 0.1)",
        border: "1px solid rgba(255, 0, 0, 0.2)",
        borderRadius: 5,
        px: 2,
        py: 0.5,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Box
          component="span"
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: "red",
            "@keyframes heartbeat": {
              "0%": {
                transform: "scale(0.8)",
                boxShadow: "0 0 0 0 rgba(255, 82, 82, 0.7)",
              },
              "70%": {
                transform: "scale(1)",
                boxShadow: "0 0 0 8px rgba(255, 82, 82, 0)",
              },
              "100%": {
                transform: "scale(0.8)",
                boxShadow: "0 0 0 0 rgba(255, 82, 82, 0)",
              },
            },
            animation:
              recordingStatus === "recording"
                ? "heartbeat 1.5s infinite"
                : "none",
          }}
        />
        <Typography
          variant="body2"
          color="red"
          sx={{ ml: 1, fontWeight: "bold" }}
        >
          Live
        </Typography>
      </Box>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontFamily: "monospace" }}
      >
        {formatTime(recordingTime)}
      </Typography>
      <MicIcon fontSize="small" sx={{ color: "text.secondary" }} />
    </Box>
  );
};

export default function Header({
  name,
  jobPosition,
  profileUrl,
  onMenuClick,
  collapsed,
}: HeaderProps & { onMenuClick?: () => void }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const drawerWidth = collapsed ? 72 : 300;

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const count = await getUnreadNotificationCount();
        setUnreadCount(count);
      } catch (error) {
        const apiError = error as ApiError;
        const response = apiError.response?.data?.message;
        console.error(response ?? "알림 조회 중 오류가 발생했습니다.");
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
        borderBottom: "1px solid #eee",
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
        zIndex: (theme) => theme.zIndex.drawer - 1,
        transition: (theme) =>
          theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          // 핵심: 모바일(xs)은 양끝 정렬, 데스크탑(md)은 오른쪽 정렬
          justifyContent: { xs: "space-between", md: "flex-end" },
          gap: 2,
          px: { xs: 2, md: 4 }, // 과했던 px: 50을 반응형으로 조정
        }}
      >
        {/* 모바일에서만 보이는 햄버거 버튼 */}
        <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center" }}>
          <IconButton color="default" onClick={onMenuClick} edge="start">
            <MenuIcon />
          </IconButton>
        </Box>

        {/* 오른쪽 정렬 아이템 그룹 */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <RecordingIndicator />

          <NotificationDropdown
            unreadCount={unreadCount}
            onReadNotification={() => setUnreadCount((prev) => prev - 1)}
          />

          {/* 이름 + 직책 */}
          <Box
            sx={{
              display: { xs: "none", sm: "inline-flex" },
              alignItems: "center",
              height: "auto",
              border: "1px solid #ccc",
              borderRadius: 5,
              px: 2,
              py: 0.5,
              backgroundColor: "#f5f5f5",
              gap: 0.5,
              minWidth: 50,
            }}
          >
            <Typography
              variant="body2"
              color="text.primary"
              sx={{ whiteSpace: "nowrap" }}
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
            <Avatar
              src={profileUrl ? `${BASE_URL}${profileUrl}` : undefined}
              sx={{ width: 40, height: 40 }}
            >
              <AccountCircleIcon fontSize="large" />
            </Avatar>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
