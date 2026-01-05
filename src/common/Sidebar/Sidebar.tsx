import React, { useState } from "react";
import HomeIcon from "@mui/icons-material/Home";
import LogoutIcon from "@mui/icons-material/Logout";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
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
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import type { SidebarProps } from "./type";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import useRecordingStore from "../../store/useRecordingStore";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

export default function Sidebar({
  items,
  collapsed = false,
  onSelect,
  onToggle,
  width = 300,
  variant = "permanent",
  isMobileSidebarOpen: isMobileSidebarOpen,
  onClose,
}: SidebarProps & { isAdmin?: boolean }) {
  const navigate = useNavigate();
  const { member, logout } = useAuthStore();
  const { clear, isAnyRecordingActive, handleLastChunk } = useRecordingStore();
  const role = member?.role;
  const isMobile = variant === "temporary";

  //로그아웃
  const handleLogout = async () => {
    if (isAnyRecordingActive()) {
      if (!window.confirm("로그아웃 시 녹음이 중단됩니다. 계속하시겠습니까?"))
        return;
      await handleLastChunk();
      clear();
    }
    logout();
    navigate("/login");
  };
  // 초기 open 상태
  const [menuOpen, setMenuOpen] = useState<{ [key: string]: boolean }>(() => {
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
  // 현재 선택된 메뉴
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
  return (
    <Drawer
      variant={variant}
      open={variant === "temporary" ? isMobileSidebarOpen : true} // 모바일일때는 상태 관리, 데스크탑은 항상 open
      onClose={onClose}
      sx={{
        width: collapsed ? 72 : width,
        flexShrink: 0,
        overflow: "visible",
        transition: "width 0.3s ease",
        "& .MuiDrawer-paper": {
          width: collapsed ? 72 : width,
          boxSizing: "border-box",
          overflow: "visible",
          transition: "width 0.3s ease",
        },
      }}
    >
      <Box
        sx={{
          flexGrow: 1, //Drawer 높이에 맞춰 남은 공간을 메뉴 리스트가 채움
          overflowY: "auto", //자동 스크롤
          "&::-webkit-scrollbar": { display: "none" }, // 웹킷 브라우저용 스크롤바 스타일
          scrollbarWidth: "none", //스크롤바 숨김
        }}
      >
        {/* 로고 */}
        <Toolbar
          sx={{
            px: 2,
            py: 3.7,
            minHeight: collapsed ? 64 : undefined,
            display: "flex",
            justifyContent: isMobile ? "center" : "space-between",
            alignItems: "center",
          }}
        >
          {/* 로고 (펼침 상태에서만) */}
          {!collapsed && (
            <Box
              display="flex"
              alignItems="center"
              sx={{ cursor: "pointer" }}
              onClick={() => navigate("/")}
            >
              <img
                src="/daehologo.gif"
                alt="로고"
                style={{ width: 200, height: 45 }}
              />
            </Box>
          )}
          {variant === "permanent" && (
            <IconButton
              onClick={onToggle}
              sx={{
                backgroundColor: "#eee",
                "&:hover": { backgroundColor: "#aaa" },
                zIndex: 10,
              }}
            >
              {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          )}
        </Toolbar>
        <Divider />
        {/* 일반 메뉴 */}

        <List>
          {userMenu.map((item) => {
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
                    else if (item.href) navigate(item.href);
                  }}
                  sx={{
                    minHeight: 48,
                    py: 2,
                    px: 2,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      mr: 1.5,
                      justifyContent: "center",
                    }}
                  >
                    <Tooltip
                      title={item.label}
                      placement="right"
                      arrow
                      disableInteractive={!collapsed}
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
                      opacity: collapsed ? 0 : 1,
                      pointerEvents: collapsed ? "none" : "auto",
                      width: collapsed ? 0 : "auto",
                      transition: "opacity 0.2s ease",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                    }}
                    slotProps={{
                      primary: {
                        sx: {
                          fontWeight:
                            selectedId === item.id || isParentSelected
                              ? 700
                              : 500,
                        },
                      },
                    }}
                  />

                  <Box
                    sx={{
                      width: 24,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      opacity: collapsed ? 0 : 1,
                      pointerEvents: collapsed ? "none" : "auto",
                      transition: "opacity 0.2s ease",
                    }}
                  >
                    {hasChildren &&
                      (menuOpen[item.id] ? <ExpandLess /> : <ExpandMore />)}
                  </Box>
                </ListItemButton>
                {hasChildren && (
                  <Collapse in={menuOpen[item.id]} timeout="auto">
                    <List component="div" disablePadding>
                      {children.map((child) => (
                        <ListItemButton
                          key={child.id}
                          sx={{ pl: 4 }}
                          selected={child.id === selectedId}
                          onClick={() => {
                            onSelect?.(child.id);
                            if (child.href) navigate(child.href);
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              minWidth: 40,
                              mr: 1.5,
                              justifyContent: "center",
                            }}
                          >
                            {child.icon ?? null}
                          </ListItemIcon>

                          <ListItemText
                            primary={child.label}
                            sx={{
                              opacity: collapsed ? 0 : 1,
                              pointerEvents: collapsed ? "none" : "auto",
                              width: collapsed ? 0 : "auto",
                              transition: "opacity 0.2s ease",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                            }}
                            slotProps={{
                              primary: {
                                sx: {
                                  fontWeight:
                                    child.id === selectedId ? 700 : 500,
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
          })}
        </List>

        {/* 관리자 메뉴 */}
        {adminMenu && role === "ADMIN" && (
          <>
            <Divider />
            <List>
              {(() => {
                const adminChildren = adminMenu.children || [];
                const isAdminParentSelected = adminChildren.some(
                  (child) => child.id === selectedId
                );
                return (
                  <React.Fragment key={adminMenu.id}>
                    <ListItemButton
                      selected={
                        selectedId === adminMenu.id || isAdminParentSelected
                      }
                      onClick={() => {
                        if (adminChildren.length > 0)
                          handleToggle(adminMenu.id);
                        else if (adminMenu.href) navigate(adminMenu.href);
                      }}
                      sx={{ px: 2 }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 40,
                          mr: 1.5,
                          justifyContent: "center",
                        }}
                      >
                        {adminMenu.icon ?? <HomeIcon />}
                      </ListItemIcon>

                      <ListItemText
                        primary={adminMenu.label}
                        sx={{
                          opacity: collapsed ? 0 : 1,
                          pointerEvents: collapsed ? "none" : "auto",
                          width: collapsed ? 0 : "auto",
                          transition: "opacity 0.2s ease",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                        }}
                        slotProps={{
                          primary: {
                            sx: {
                              fontWeight:
                                selectedId === adminMenu.id ||
                                isAdminParentSelected
                                  ? 700
                                  : 500,
                            },
                          },
                        }}
                      />

                      {!collapsed &&
                        adminChildren.length > 0 &&
                        (menuOpen[adminMenu.id] ? (
                          <ExpandLess />
                        ) : (
                          <ExpandMore />
                        ))}
                    </ListItemButton>
                    {adminChildren.length > 0 && (
                      <Collapse in={menuOpen[adminMenu.id]} timeout="auto">
                        <List component="div" disablePadding>
                          {adminChildren.map((child) => (
                            <ListItemButton
                              key={child.id}
                              sx={{ pl: 4 }}
                              selected={child.id === selectedId}
                              onClick={() => {
                                onSelect?.(child.id);
                                if (child.href) navigate(child.href);
                              }}
                            >
                              <ListItemIcon
                                sx={{
                                  minWidth: 40,
                                  mr: 1.5,
                                  justifyContent: "center",
                                }}
                              >
                                {child.icon ?? null}
                              </ListItemIcon>

                              <ListItemText
                                primary={child.label}
                                sx={{
                                  opacity: collapsed ? 0 : 1,
                                  pointerEvents: collapsed ? "none" : "auto",
                                  width: collapsed ? 0 : "auto",
                                  transition: "opacity 0.2s ease",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                }}
                                slotProps={{
                                  primary: {
                                    sx: {
                                      fontWeight:
                                        child.id === selectedId ? 700 : 500,
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
              })()}
            </List>
          </>
        )}
      </Box>
      <Box flexGrow={1} />
      <Divider />
      <Box p={2} display="flex" alignItems="center" gap={1}>
        {/* Logout */}
        <Button
          variant="text"
          startIcon={<LogoutIcon />}
          fullWidth
          sx={{
            justifyContent: "flex-start",
            color: "#1a1a1adb",
            "&:focus": { outline: "none", boxShadow: "none" },
          }}
          onClick={handleLogout}
        >
          {!collapsed && "Logout"}
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
    </Drawer>
  );
}
