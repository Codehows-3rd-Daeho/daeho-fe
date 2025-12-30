import SpaceDashboardIcon from "@mui/icons-material/SpaceDashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import GroupsIcon from "@mui/icons-material/Groups";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import ManageHistoryIcon from "@mui/icons-material/ManageHistory";
import SettingsIcon from "@mui/icons-material/Settings";
import WorkIcon from "@mui/icons-material/Work";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { RiListSettingsFill } from "react-icons/ri";

import type { SidebarItem } from "./type";

export const sidebarItems: SidebarItem[] = [
  {
    id: "dashboard",
    label: "대시보드",
    icon: <SpaceDashboardIcon />,
    href: "/",
  },
  {
    id: "issue",
    label: "이슈",
    icon: <AssignmentIcon />,
    href: "/issue/kanban",
  },
  { id: "meeting", label: "회의", icon: <GroupsIcon />, href: "/meeting/list" },
  {
    id: "meeting-schedule",
    label: "회의 일정표",
    icon: <CalendarMonthIcon />,
    href: "/meeting/schedule",
  },
  {
    id: "mytask",
    label: "나의 업무",
    icon: <WorkIcon />,
    children: [
      {
        id: "mytask-issue",
        icon: <AssignmentIcon fontSize="small" />,
        label: "이슈",
        href: "/mytask/issue/kanban",
      },
      {
        id: "mytask-meeting",
        icon: <GroupsIcon fontSize="small" />,
        label: "회의",
        href: "/mytask/meeting",
      },
      {
        id: "mytask-schedule",
        icon: <CalendarMonthIcon fontSize="small" />,
        label: "회의 일정표",
        href: "/mytask/schedule",
      },
    ],
  },
  {
    id: "admin",
    label: "관리자",
    icon: <SettingsIcon />,
    children: [
      {
        id: "admin-member",
        icon: <ManageAccountsIcon fontSize="small" />,
        label: "회원 관리",
        href: "/admin/member",
      },
      {
        id: "admin-log",
        icon: <ManageHistoryIcon fontSize="small" />,
        label: "로그 조회",
        href: "/admin/log",
      },
      {
        id: "admin-setting",
        icon: <RiListSettingsFill fontSize="large" />,
        label: "관리자 설정",
        href: "/admin/setting",
      },
    ],
  },
];
