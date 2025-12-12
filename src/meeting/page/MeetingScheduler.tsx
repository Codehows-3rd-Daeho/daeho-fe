import { useState } from "react";
import Scheduler from "react-mui-scheduler";
import { Container } from "@mui/material";

export default function MeetingScheduler() {
  const [state] = useState({
    options: {
      transitionMode: "zoom", // 화면 전환 효과
      startWeekOn: "mon", // 주 시작 요일
      defaultMode: "month", // 기본 뷰
      minWidth: 800,
      maxWidth: 800,
      minHeight: 600,
      maxHeight: 600,
    },
    alertProps: {
      open: true,
      color: "info",
      severity: "info",
      message: "🚀 회의 일정 관리 달력이 준비되었습니다!",
      showActionButton: true,
      showNotification: true,
      delay: 1500,
    },
    toolbarProps: {
      showSearchBar: true,
      showSwitchModeButtons: true,
      showDatePicker: true,
    },
  });

  // 예시 회의 일정
  const events = [
    {
      id: "1",
      label: "팀 스프린트 회의",
      groupLabel: "개발팀",
      user: "개발팀",
      color: "#4caf50",
      startHour: "09:00 AM",
      endHour: "10:00 AM",
      date: "2025-11-28",
      createdAt: new Date(),
      createdBy: "관리자",
    },
    {
      id: "2",
      label: "디자인 리뷰",
      groupLabel: "디자인팀",
      user: "디자인팀",
      color: "#2196f3",
      startHour: "11:00 AM",
      endHour: "12:00 PM",
      date: "2025-11-28",
      createdAt: new Date(),
      createdBy: "관리자",
    },
    {
      id: "3",
      label: "고객 미팅",
      groupLabel: "영업팀",
      user: "영업팀",
      color: "#f44336",
      startHour: "02:00 PM",
      endHour: "03:00 PM",
      date: "2025-11-28",
      createdAt: new Date(),
      createdBy: "관리자",
    },
  ];

  // const handleCellClick = (event, row, day) => {
  //   console.log("셀 클릭:", { row, day });
  // };

  // const handleEventClick = (event, item) => {
  //   console.log("회의 클릭:", item);
  // };

  // const handleEventsChange = (item) => {
  //   console.log("이벤트 변경:", item);
  // };

  // const handleAlertCloseButtonClicked = (item) => {
  //   console.log("Alert 닫기 클릭:", item);
  // };

  return (
    <Container style={{ marginTop: 40 }}>
      <Scheduler
        locale="ko"
        events={events}
        legacyStyle={false}
        options={state.options}
        alertProps={state.alertProps}
        toolbarProps={state.toolbarProps}
      />
    </Container>
  );
}
