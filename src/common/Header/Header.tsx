import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Badge,
  Menu,
  MenuItem,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import type { HeaderProps } from "./type";

export default function Header({
  name,
  jobPosition,
  notifications,
}: HeaderProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: "#fff",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <Toolbar sx={{ justifyContent: "flex-end", gap: 2 }}>
        {/* 1️⃣ 알림 */}
        <IconButton sx={{ color: "#333" }} onClick={handleClick}>
          {/* 알림 있으면 빨간불 표시 */}
          <Badge
            variant="dot"
            color="error"
            invisible={notifications.length === 0}
          >
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          {notifications.length === 0 ? (
            <MenuItem>알림이 없습니다.</MenuItem>
          ) : (
            notifications.map((msg, idx) => (
              <MenuItem key={idx}>{msg}</MenuItem>
            ))
          )}
        </Menu>

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
