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
import { getMyNotifications, readNotification } from "../api/notificationApi";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import CloseIcon from "@mui/icons-material/Close";
import type { NotificationType } from "../type";
import { useNavigate } from "react-router-dom";
import type { ApiError } from "../../config/httpClient";

interface Props {
  unreadCount: number;
  onReadNotification: () => void;
}
export default function NotificationDropdown({
  unreadCount,
  onReadNotification,
}: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const navigate = useNavigate();

  const open = Boolean(anchorEl);
  const fetchNotifications = async (pageToLoad: number) => {
    try {
      const res = await getMyNotifications(pageToLoad, 5);
      const content = res.content ?? [];
      setNotifications((prev) =>
        pageToLoad === 0 ? content : [...prev, ...content]
      );
      setHasNext(!res.last);
    } catch (error) {
      const apiError = error as ApiError;
      const response = apiError.response?.data?.message;
      alert(response ?? "알림 조회 중 오류가 발생했습니다.");
    }
  };

  const handleClick = async (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    try {
      await fetchNotifications(0);
      setPage(0);
    } catch (error) {
      const apiError = error as ApiError;
      const response = apiError.response?.data?.message;
      alert(response ?? "알림 불러오기 중 오류가 발생했습니다.");
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          p: 1.5,
          transition: "all 0.2s",
        }}
      >
        <Badge
          badgeContent={unreadCount}
          color="error"
          sx={{
            "& .MuiBadge-badge": {
              minWidth: 20,
              height: 20,
              fontSize: 11,
              fontWeight: 700,
            },
          }}
        >
          <NotificationsIcon sx={{ fontSize: 24 }} />
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
              maxHeight: 660,
              borderRadius: 3,
            },
          },
        }}
      >
        {/* 헤더 */}
        <Box
          sx={{
            px: 3,
            py: 2.5,
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor: "white",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: "1.125rem",
              color: "#1e293b",
            }}
          >
            알림
          </Typography>
          <IconButton
            size="small"
            onClick={handleClose}
            sx={{
              "&:hover": {
                bgcolor: "#f1f5f9",
              },
            }}
          >
            <CloseIcon sx={{ fontSize: 20, color: "#94a3b8" }} />
          </IconButton>
        </Box>

        <List sx={{ p: 0 }}>
          {notifications.map((notification, index) => {
            const [title, body = ""] = notification.message.split("\n");

            return (
              <React.Fragment key={index}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    px: 3,
                    py: 2,
                    cursor: "pointer",
                    bgcolor: notification.isRead ? "transparent" : "#f0f9ff",
                    "&:hover": {
                      bgcolor: notification.isRead ? "#f8fafc" : "#e0f2fe",
                    },
                  }}
                  onClick={async () => {
                    if (!notification.isRead) {
                      try {
                        await readNotification(notification.id);
                        setNotifications((prev) =>
                          prev.map((n) =>
                            n.id === notification.id
                              ? { ...n, isRead: true }
                              : n
                          )
                        );
                        onReadNotification();
                      } catch (error) {
                        const apiError = error as ApiError;
                        const response = apiError.response?.data?.message;
                        alert(response ?? "알림 읽기 중 오류가 발생했습니다.");
                        return;
                      }
                    }
                    navigate(notification.forwardUrl);
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: 44, mt: 1 }}>
                    <Badge
                      variant="dot"
                      color="primary"
                      invisible={notification.isRead}
                      overlap="circular"
                      anchorOrigin={{
                        vertical: "top",
                        horizontal: "right",
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: "#f3f4f6",
                          color: "#6b7280",
                        }}
                      >
                        <NotificationsNoneIcon fontSize="small" />
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>

                  <ListItemText
                    sx={{ ml: 1.5, minWidth: 0 }}
                    primary={
                      <Box>
                        {/* 제목 */}
                        <Typography
                          fontSize="0.95rem"
                          fontWeight={notification.isRead ? 400 : 600}
                          sx={{ whiteSpace: "pre-line" }}
                        >
                          {title}
                        </Typography>

                        {/* 내용: */}
                        <Typography
                          fontSize="0.9rem"
                          color="#475569"
                          sx={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {body}
                        </Typography>
                      </Box>
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
            );
          })}
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
