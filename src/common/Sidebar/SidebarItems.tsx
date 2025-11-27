import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import GroupsIcon from "@mui/icons-material/Groups";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import QueryBuilderIcon from "@mui/icons-material/QueryBuilder";
import type { SidebarItem } from "./type";

export const sidebarItems: SidebarItem[] = [
  { id: "dashboard", label: "대시보드", icon: <DashboardIcon />, href: "/" },
  {
    id: "issue",
    label: "이슈",
    icon: <AssignmentIcon />,
    href: "/issue/list",
  },
  { id: "meeting", label: "회의", icon: <GroupsIcon />, href: "/meeting/list" },
  {
    id: "meeting-schedule",
    label: "회의 일정표",
    icon: <CalendarTodayIcon />,
    href: "/meeting/schedule",
  },
  {
    id: "mytask",
    label: "나의 업무",
    icon: <QueryBuilderIcon />,
    children: [
      { id: "mytask-issue", label: "이슈", href: "/mytask/issue" },
      { id: "mytask-meeting", label: "회의", href: "/mytask/meeting" },
      { id: "mytask-schedule", label: "회의 일정표", href: "/mytask/schedule" },
    ],
  },
  {
    id: "admin",
    label: "관리자",
    icon: <ManageAccountsIcon />,
    children: [
      { id: "admin-member", label: "회원 관리", href: "/admin/member" },
      { id: "admin-log", label: "로그 조회", href: "/admin/log" },
      { id: "admin-setting", label: "관리자 설정", href: "/admin/setting" },
    ],
  },
];
