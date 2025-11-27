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

export default function Sidebar({
  items,
  collapsed = false,
  onSelect,
  width = 300,
}: SidebarProps & { isAdmin?: boolean }) {
  // 현재 페이지 기준으로 부모 Collapse 초기 열기 상태 세팅
  const [open, setOpen] = useState<{ [key: string]: boolean }>(() => {
    const path = window.location.pathname;
    const initialOpen: { [key: string]: boolean } = {};
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

  // 현재 페이지 기준으로 선택된 메뉴 판단
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

  // 사용자용 메뉴, 관리자용 메뉴 분리
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
      {/* 로고 영역 */}
      <Toolbar>
        <Box
          display="flex"
          alignItems="center"
          gap={1}
          sx={{ cursor: "pointer", py: 3.7 }}
          onClick={() => (window.location.href = "/")}
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
                  else if (item.href) window.location.href = item.href;
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
                    {item.children?.map((child) => (
                      <ListItemButton
                        key={child.id}
                        sx={{ pl: 4 }}
                        selected={child.id === selectedId}
                        onClick={() => {
                          onSelect?.(child.id);
                          if (child.href) window.location.href = child.href;
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
              const isAdminParentSelected =
                adminChildren.length > 0 &&
                adminChildren.some((child) => child.id === selectedId);

              return (
                <React.Fragment key={adminMenu.id}>
                  <ListItemButton
                    selected={
                      selectedId === adminMenu.id || isAdminParentSelected
                    }
                    onClick={() => {
                      if (adminMenu.children && adminMenu.children.length > 0) {
                        handleToggle(adminMenu.id);
                      } else {
                        onSelect?.(adminMenu.id);
                        if (adminMenu.href)
                          window.location.href = adminMenu.href;
                      }
                    }}
                  >
                    <ListItemIcon>
                      {adminMenu.icon ?? <HomeIcon />}
                    </ListItemIcon>
                    {!collapsed && <ListItemText primary={adminMenu.label} />}
                    {!collapsed &&
                      adminMenu.children &&
                      adminMenu.children.length > 0 &&
                      (open[adminMenu.id] ? <ExpandLess /> : <ExpandMore />)}
                  </ListItemButton>

                  {adminMenu.children && adminMenu.children.length > 0 && (
                    <Collapse
                      in={open[adminMenu.id]}
                      timeout="auto"
                      unmountOnExit
                    >
                      <List component="div" disablePadding>
                        {adminMenu.children.map((child) => (
                          <ListItemButton
                            key={child.id}
                            sx={{ pl: 4 }}
                            selected={child.id === selectedId}
                            onClick={() => {
                              onSelect?.(child.id);
                              if (child.href) window.location.href = child.href;
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

      <Box flexGrow={1} />
      <Divider />
      <Box flexGrow={1} />
      <Divider />

      {/* 로그아웃 버튼 */}
      <Box p={2}>
        <Button
          variant="text"
          startIcon={<LogoutIcon />}
          fullWidth
          sx={{
            justifyContent: "flex-start",
            color: "#1a1a1adb",
            "&:focus": {
              outline: "none",
              boxShadow: "none",
            },
          }}
          onClick={() => console.log("로그아웃 클릭")}
        >
          Logout
        </Button>
      </Box>
    </Drawer>
  );
}
