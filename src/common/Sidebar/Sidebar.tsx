import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Box,
  Button,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import LogoutIcon from "@mui/icons-material/Logout";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

import type { SidebarProps, SidebarItem } from "./type";
import { useAuthStore } from "../../store/useAuthStore";
import useRecordingStore from "../../store/useRecordingStore";

export default function Sidebar({
  items,
  collapsed = false,
  onSelect,
  onToggle,
  width = 300,
  openMobile = false,
  onCloseMobile,
}: SidebarProps) {
  const navigate = useNavigate();
  const { member, logout } = useAuthStore();
  const { clear, isAnyRecordingActive, handleLastChunk } = useRecordingStore();
  const role = member?.role;
  const isMobile = variant === "temporary";

  const handleLogout = async () => {
    if (isAnyRecordingActive()) {
      if (!window.confirm("로그아웃 시 녹음이 중단됩니다. 계속하시겠습니까?"))
        return;
      await handleLastChunk();
      clear();
    }
    logout();
    if (openMobile) onCloseMobile?.(); // 로그아웃 시 모바일 사이드바 닫기
    navigate("/login");
  };

  const [open, setOpen] = useState<{ [key: string]: boolean }>(() => {
    const path = window.location.pathname;
    const initialOpen: Record<string, boolean> = {};
    items.forEach((item) => {
      if (item.children?.some((child) => child.href === path)) {
        initialOpen[item.id] = true;
      }
    });
    return initialOpen;
  });

  const handleToggle = (id: string) => {
    setMenuOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const selectedId = (() => {
    const path = window.location.pathname;
    let selected: string | null = null;
    items.forEach((item) => {
      if (item.href === path) selected = item.id;
      item.children?.forEach((child) => {
        if (child.href === path) selected = child.id;
      });
    });
    return selected;
  })();

  const userMenu = items.filter((item) => item.id !== "admin");
  const adminMenu = items.find((item) => item.id === "admin");

  const renderMenuItems = (menuList: SidebarItem[]) => {
    return menuList.map((item) => {
      const children = item.children || [];
      const hasChildren = children.length > 0;
      const isParentSelected =
        hasChildren && children.some((child) => child.id === selectedId);

      return (
        <React.Fragment key={item.id}>
          <ListItemButton
            disabled={item.disabled}
            selected={selectedId === item.id || isParentSelected}
            onClick={() => {
              if (hasChildren) handleToggle(item.id);
              else if (item.href) {
                navigate(item.href);
                if (openMobile) onCloseMobile?.();
              }
            }}
            sx={{ minHeight: 48, py: 1.5, px: 2 }}
          >
            <ListItemIcon
              sx={{ minWidth: 40, mr: 1.5, justifyContent: "center" }}
            >
              <Tooltip
                title={item.label}
                placement="right"
                arrow
                disableInteractive={!collapsed || openMobile}
              >
                <Box display="inline-flex">
                  {item.badge ? (
                    <Badge badgeContent={item.badge} color="primary">
                      {item.icon ?? <HomeIcon />}
                    </Badge>
                  ) : (
                    item.icon ?? <HomeIcon />
                  )}
                </Box>
              </Tooltip>
            </ListItemIcon>

            <ListItemText
              primary={item.label}
              sx={{
                opacity: collapsed && !openMobile ? 0 : 1,
                transition: "opacity 0.2s ease",
                whiteSpace: "nowrap",
              }}
              slotProps={{
                primary: {
                  sx: {
                    fontWeight:
                      selectedId === item.id || isParentSelected ? 700 : 500,
                  },
                },
              }}
            />

            {hasChildren && !(collapsed && !openMobile) && (
              <Box sx={{ display: "flex" }}>
                {open[item.id] ? <ExpandLess /> : <ExpandMore />}
              </Box>
            )}
          </ListItemButton>

          {hasChildren && (
            <Collapse in={open[item.id]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {children.map((child: SidebarItem) => (
                  <ListItemButton
                    key={child.id}
                    sx={{ pl: 4 }}
                    selected={child.id === selectedId}
                    onClick={() => {
                      onSelect?.(child.id);
                      if (child.href) {
                        navigate(child.href);
                        if (openMobile) onCloseMobile?.();
                      }
                    }}
                  >
                    {/* 자식 아이콘 추가 영역 */}
                    {child.icon && (
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {child.icon}
                      </ListItemIcon>
                    )}

                    <ListItemText
                      primary={child.label}
                      sx={{
                        opacity: collapsed && !openMobile ? 0 : 1,

                        pr: 1,
                      }}
                      slotProps={{
                        primary: {
                          sx: {
                            fontWeight: child.id === selectedId ? 700 : 500,
                            display: "block",
                          },
                        },
                      }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
          )}
        </React.Fragment>
      );
    });
  };

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        <Toolbar
          sx={{
            px: 2,
            py: 3,
            display: "flex",
            justifyContent:
              collapsed && !openMobile ? "center" : "space-between",
          }}
        >
          {!(collapsed && !openMobile) && (
            <Box
              sx={{ cursor: "pointer" }}
              onClick={() => {
                navigate("/");
                if (openMobile) onCloseMobile?.(); // 로고 클릭 시 모바일 사이드바 닫기
              }}
            >
              <img
                src="/daehologo.gif"
                alt="로고"
                style={{ width: 150, height: "auto" }}
              />
            </Box>
          )}
          <IconButton
            onClick={openMobile ? onCloseMobile : onToggle}
            sx={{ backgroundColor: "#eee" }}
          >
            {collapsed && !openMobile ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </IconButton>
        </Toolbar>

        <Divider />

        <List>{renderMenuItems(userMenu)}</List>

        {adminMenu && role === "ADMIN" && (
          <>
            <Divider sx={{ my: 1 }} />
            <Box
              sx={{
                px: 3,
                py: 1,
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "text.secondary",
                display: collapsed && !openMobile ? "none" : "block",
              }}
            ></Box>
            <List>{renderMenuItems([adminMenu])}</List>
          </>
        )}
      </Box>

      <Divider />
      <Box p={2} display="flex" alignItems="center" gap={1}>
        {/* Logout */}
        <Button
          variant="text"
          startIcon={<LogoutIcon />}
          fullWidth
          sx={{ justifyContent: "flex-start", color: "#d32f2f" }}
          onClick={handleLogout}
        >
          {!(collapsed && !openMobile) && "Logout"}
        </Button>

        {/* PWA Guide */}
        <Tooltip title="앱 설치 가이드">
          <IconButton
            size="small"
            onClick={() => navigate("/pwa-guide")}
            sx={{
              color: "#555",
              "&:hover": { backgroundColor: "#eee" },
            }}
          >
            <HelpOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: collapsed ? 72 : width,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: collapsed ? 72 : width,
            boxSizing: "border-box",
            transition: "width 0.3s ease",
            overflowX: "hidden",
            borderRight: "1px solid #eee",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="temporary"
        open={openMobile}
        onClose={onCloseMobile}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: width,
            boxSizing: "border-box",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}
