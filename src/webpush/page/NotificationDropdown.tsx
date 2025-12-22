import React, { useState } from "react";
import {
  Box,
  IconButton,
  Badge,
  Popover,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Button,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { getMyNotifications } from "../api/notificationApi";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import type { NotificationType } from "../type";
import { useNavigate } from "react-router-dom";

export default function NotificationDropdown() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const navigate = useNavigate();

  const open = Boolean(anchorEl);
  // const unreadCount = notifications.length; // 읽음 처리 전

  const fetchNotifications = async (pageToLoad: number) => {
    try {
      const res = await getMyNotifications(pageToLoad, 5);

      setNotifications((prev) =>
        pageToLoad === 0 ? res.content : [...prev, ...res.content]
      );

      setHasNext(!res.last); // Spring Page 기준
    } catch (e) {
      console.error("알림 조회 실패", e);
    }
  };

  const handleClick = async (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setPage(0);
    await fetchNotifications(0);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton onClick={handleClick} sx={{ color: "#333" }}>
        <Badge
          // badgeContent={unreadCount}
          color="error"
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              width: 420,
              maxHeight: 600,
              borderRadius: 3,
            },
          },
        }}
      >
        <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #e2e8f0" }}>
          <Typography variant="h6" fontWeight={700}>
            알림
          </Typography>
        </Box>

        <List sx={{ p: 0 }}>
          {notifications.map((notification, index) => (
            <React.Fragment key={index}>
              <ListItem
                alignItems="flex-start"
                sx={{ px: 3, py: 2, cursor: "pointer" }}
                onClick={() => navigate(notification.forwardUrl)}
              >
                <ListItemAvatar sx={{ minWidth: 44, mt: 0.5 }}>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: "#e0f2fe",
                      color: "#0284c7",
                    }}
                  >
                    <NotificationsNoneIcon fontSize="small" />
                  </Avatar>
                </ListItemAvatar>

                <ListItemText
                  sx={{ ml: 1.5 }}
                  primary={
                    <Typography
                      fontSize="0.95rem"
                      fontWeight={500}
                      sx={{ whiteSpace: "pre-line" }}
                    >
                      {notification.message}
                    </Typography>
                  }
                  secondary={
                    <Typography fontSize="0.8rem" color="#94a3b8">
                      {notification.createdAt}
                    </Typography>
                  }
                />
              </ListItem>

              {index < notifications.length - 1 && <Divider sx={{ mx: 3 }} />}
            </React.Fragment>
          ))}
        </List>

        <Box
          sx={{
            px: 2,
            py: 1,
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            bgcolor: "#f8fafc",
          }}
        >
          <Button
            size="small"
            disabled={!hasNext}
            onClick={async () => {
              const nextPage = page + 1;
              setPage(nextPage);
              await fetchNotifications(nextPage);
            }}
          >
            + 더보기
          </Button>
        </Box>
      </Popover>
    </>
  );
}
