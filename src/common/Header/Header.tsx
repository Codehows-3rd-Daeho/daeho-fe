import { AppBar, Toolbar, IconButton, Typography, Box } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MicIcon from "@mui/icons-material/Mic";
import type { HeaderProps } from "./type";
import NotificationDropdown from "../../webpush/page/NotificationDropdown";
import { useEffect, useState } from "react";
import { getUnreadNotificationCount } from "../../webpush/api/notificationApi";
import useRecordingStore from "../../store/useRecordingStore";
import { useNavigate } from "react-router-dom";

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
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
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        border: '1px solid rgba(255, 0, 0, 0.2)',
        borderRadius: 5,
        px: 2,
        py: 0.5,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box 
          component="span"
          sx={{
            width: 8, height: 8, borderRadius: '50%', bgcolor: 'red',
            '@keyframes heartbeat': {
              '0%': { transform: 'scale(0.8)', boxShadow: '0 0 0 0 rgba(255, 82, 82, 0.7)' },
              '70%': { transform: 'scale(1)', boxShadow: '0 0 0 8px rgba(255, 82, 82, 0)' },
              '100%': { transform: 'scale(0.8)', boxShadow: '0 0 0 0 rgba(255, 82, 82, 0)' }
            },
            animation: recordingStatus === 'recording' ? 'heartbeat 1.5s infinite' : 'none',
          }}
        />
        <Typography variant="body2" color="red" sx={{ ml: 1, fontWeight: 'bold' }}>
          Live
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
        {formatTime(recordingTime)}
      </Typography>
      <MicIcon fontSize="small" sx={{ color: 'text.secondary' }} />
    </Box>
  );
}


export default function Header({ name, jobPosition }: HeaderProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
    };

    fetchUnreadCount();
  }, []);

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: "#fff",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <Toolbar sx={{ justifyContent: "flex-end", gap: 2 }}>
        <RecordingIndicator />
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
