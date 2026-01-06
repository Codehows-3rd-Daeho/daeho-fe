import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { MeetingListItem } from "../../meeting/type/type";
import { getMeetingMonthMT } from "../../meeting/api/MeetingApi";
import { useAuthStore } from "../../store/useAuthStore";
import type { ApiError } from "../../config/httpClient";
import MobileMeetingSchedule from "../../meeting/page/MobileMeetingSchedule";
import DesktopMeetingSchedule from "../../meeting/page/DesktopMeetingSchedule";

function getMonthMatrix(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  const matrix: (number | null)[][] = [];
  let week: (number | null)[] = Array(firstDay).fill(null);

  for (let d = 1; d <= lastDate; d++) {
    week.push(d);
    if (week.length === 7) {
      matrix.push(week);
      week = [];
    }
  }

  if (week.length) {
    matrix.push([...week, ...Array(7 - week.length).fill(null)]);
  }

  return matrix;
}

function getMonthDays(year: number, month: number) {
  const days = [];
  const lastDate = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= lastDate; day++) {
    days.push(new Date(year, month, day));
  }

  return days;
}

export default function MTMeetingScheduler() {
  const { member } = useAuthStore();
  const navigate = useNavigate();

  const today = new Date();
  const [current, setCurrent] = useState(new Date());
  const [isListView, setIsListView] = useState(false);

  const year = current.getFullYear();
  const month = current.getMonth();

  const matrix = useMemo(() => getMonthMatrix(year, month), [year, month]);
  const monthDays = useMemo(() => getMonthDays(year, month), [year, month]);

  const isToday = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  const isTodayDate = (date: Date) =>
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const getDayColor = (date: Date) => {
    const day = date.getDay();
    if (day === 0) return "#dc2626"; // 일요일 - 빨강
    if (day === 6) return "#2563eb"; // 토요일 - 파랑
    return "#111827";
  };
  const formatDate = (date: Date) => {
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    return `${date.getDate()}일 (${dayNames[date.getDay()]})`;
  };

  // 화면 너비 감지 - 1500px 미만이면 리스트뷰
  useEffect(() => {
    const handleResize = () => {
      setIsListView(window.innerWidth < 600);
    };

    handleResize(); // 초기 실행
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  //회의 조회용
  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);

  //달이 바뀔 때마다 데이터 조회
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await getMeetingMonthMT(
          member!.memberId,
          year,
          month + 1
        );
        setMeetings(response);
      } catch (error) {
        const apiError = error as ApiError;
        const response = apiError.response?.data?.message;
        alert(response ?? "오류가 발생했습니다.");
      }
    };

    fetchMeetings();
  }, [year, month]);

  //날짜별로 회의 묶음
  const meetingsByDay = useMemo(() => {
    //useMemo: 메모리에 저장되어있는 계산된 값을 가져와 재사용
    const map = new Map<number, MeetingListItem[]>(); // 1 -> [회의1, 회의2, 회의4], 6 -> [...]

    //서버에서 받아온 응답(meetings)을 순회
    meetings.forEach((meeting) => {
      // JavaScript가 지원하는 날짜 문자열 형식으로 변경
      const date = new Date(meeting.startDate.replace(" ", "T")); //시작일 추출 2025-12-25T12:00
      if (isNaN(date.getTime())) return;
      const day = date.getDate(); //일자만 추출 25

      //시작일 없으면 빈배열 추가
      if (!map.has(day)) {
        map.set(day, []);
      }
      //해당 날짜에 배열 넣고 회의 추가
      map.get(day)!.push(meeting);
    });

    return map;
  }, [meetings]);

  //더보기시 확장
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());

  const toggleExpand = (day: number) => {
    setExpandedDays((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(day)) newSet.delete(day); // 이미 확장되었으면 접기
      else newSet.add(day); // 확장
      return newSet;
    });
  };

  return isListView ? (
    <MobileMeetingSchedule
      year={year}
      month={month}
      monthDays={monthDays}
      meetingsByDay={meetingsByDay}
      expandedDays={expandedDays}
      toggleExpand={toggleExpand}
      isTodayDate={isTodayDate}
      getDayColor={getDayColor}
      formatDate={formatDate}
      setCurrent={setCurrent}
      navigate={navigate}
    />
  ) : (
    <DesktopMeetingSchedule
      year={year}
      month={month}
      matrix={matrix}
      meetingsByDay={meetingsByDay}
      expandedDays={expandedDays}
      toggleExpand={toggleExpand}
      setCurrent={setCurrent}
      navigate={navigate}
      isToday={isToday}
    />
  );
}
