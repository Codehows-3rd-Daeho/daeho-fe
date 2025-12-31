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
export default function Sidebar({
  items,
  collapsed = false,
  onSelect,
  onToggle,
  width = 300,
}: SidebarProps & { isAdmin?: boolean }) {
  const navigate = useNavigate();
  const { member, logout } = useAuthStore();
  const { clear, isAnyRecordingActive, handleLastChunk } = useRecordingStore();
  const role = member?.role;

  //로그아웃
  const handleLogout = async () => {
    if(isAnyRecordingActive()){
      if(!window.confirm("로그아웃 시 녹음이 중단됩니다. 계속하시겠습니까?"))
        return;
      await handleLastChunk();
      clear();
    }
    logout();
    navigate("/login");
  };
  // 초기 open 상태
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
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));
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
      variant="permanent"
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
      {/* 로고 */}
      <Toolbar
        sx={{
          px: 0,
          minHeight: collapsed ? 64 : undefined,
          display: "flex",
          justifyContent: "center",
        }}
      >
        {!collapsed ? (
          <Box
            display="flex"
            alignItems="center"
            sx={{ cursor: "pointer", py: 3.7 }}
            onClick={() => navigate("/")}
          >
            <img
              src="/daehologo.gif"
              alt="로고"
              style={{ width: 244, height: 50 }}
            />
          </Box>
        ) : (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            sx={{ height: 110 }}
          >
            <IconButton onClick={() => navigate("/")}>
              <HomeIcon />
            </IconButton>
          </Box>
        )}
        <IconButton
          onClick={onToggle}
          sx={{
            position: "absolute",
            right: -20,
            top: "50%",
            transform: "translateY(-50%)",
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            "&:hover": { backgroundColor: "#f0f0f0" },
            zIndex: 10,
          }}
        >
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
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
                    (open[item.id] ? <ExpandLess /> : <ExpandMore />)}
                </Box>
              </ListItemButton>
              {hasChildren && (
                <Collapse in={open[item.id]} timeout="auto">
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
                                fontWeight: child.id === selectedId ? 700 : 500,
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
                      if (adminChildren.length > 0) handleToggle(adminMenu.id);
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
                      (open[adminMenu.id] ? <ExpandLess /> : <ExpandMore />)}
                  </ListItemButton>
                  {adminChildren.length > 0 && (
                    <Collapse in={open[adminMenu.id]} timeout="auto">
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
      {/* Logout */}
      <Box flexGrow={1} />
      <Divider />
      <Box p={2}>
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
      </Box>
    </Drawer>
  );
}
