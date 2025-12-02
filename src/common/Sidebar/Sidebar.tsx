import React, { useState } from "react";
import HomeIcon from "@mui/icons-material/Home";
import LogoutIcon from "@mui/icons-material/Logout";
import {
  Badge,
  Box,
  Button,
  Collapse,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import type { SidebarProps } from "./type";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
export default function Sidebar({
  items,
  collapsed = false,
  onSelect,
  width = 300,
}: SidebarProps & { isAdmin?: boolean }) {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  //로그아웃
  const handleLogout = () => {
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
        "& .MuiDrawer-paper": {
          width: collapsed ? 72 : width,
          boxSizing: "border-box",
        },
      }}
    >
      {/* 로고 */}
      <Toolbar>
        <Box
          display="flex"
          alignItems="center"
          gap={1}
          sx={{ cursor: "pointer", py: 3.7 }}
          onClick={() => navigate("/")}
        >
          <img
            src="/daehologo.gif"
            alt="로고"
            style={{ width: 244, height: 50 }}
          />
        </Box>
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
              >
                <ListItemIcon>
                  {item.badge ? (
                    <Badge badgeContent={item.badge} color="primary">
                      {item.icon ?? <HomeIcon />}
                    </Badge>
                  ) : (
                    item.icon ?? <HomeIcon />
                  )}
                </ListItemIcon>
                {!collapsed && <ListItemText primary={item.label} />}
                {!collapsed &&
                  hasChildren &&
                  (open[item.id] ? <ExpandLess /> : <ExpandMore />)}
              </ListItemButton>
              {hasChildren && (
                <Collapse in={open[item.id]} timeout="auto" unmountOnExit>
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
                        <ListItemIcon>{child.icon ?? null}</ListItemIcon>
                        <ListItemText primary={child.label} />
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
      {adminMenu && (
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
                  >
                    <ListItemIcon>
                      {adminMenu.icon ?? <HomeIcon />}
                    </ListItemIcon>
                    {!collapsed && <ListItemText primary={adminMenu.label} />}
                    {!collapsed &&
                      adminChildren.length > 0 &&
                      (open[adminMenu.id] ? <ExpandLess /> : <ExpandMore />)}
                  </ListItemButton>
                  {adminChildren.length > 0 && (
                    <Collapse
                      in={open[adminMenu.id]}
                      timeout="auto"
                      unmountOnExit
                    >
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
                            <ListItemIcon>{child.icon ?? null}</ListItemIcon>
                            <ListItemText primary={child.label} />
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
          Logout
        </Button>
      </Box>
    </Drawer>
  );
}
