import { useEffect, useMemo, useState } from "react";
import { getMeetingMonth } from "../api/MeetingApi";
import type { MeetingListItem } from "../type/type";
import { useNavigate } from "react-router-dom";
import type { ApiError } from "../../config/httpClient";
import MobileMeetingSchedule from "./MobileMeetingSchedule";
import DesktopMeetingSchedule from "./DesktopMeetingSchedule";

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

export default function MeetingScheduler() {
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
        const response = await getMeetingMonth(year, month + 1);
        setMeetings(response);
      } catch (error) {
        const apiError = error as ApiError;
        const response = apiError.response?.data?.message;
        alert(response ?? "오류가 발생했습니다.");
      }
    };

    fetchMeetings();
  }, [year, month]); // year나 month가 바뀌면 실행

  //날짜별로 회의 묶음
  const meetingsByDay = useMemo(() => {
    const map = new Map<number, MeetingListItem[]>();

    meetings.forEach((meeting) => {
      // "2024-12-25" 형태의 문자열에서 연, 월, 일을 직접 추출 (안전함)
      const [datePart] = meeting.startDate.split(" "); // "2024-12-25"
      const [mYear, mMonth, mDay] = datePart.split("-").map(Number);

      // 서버에서 가져온 데이터 중, 현재 달력의 연/월과 일치하는 것만 매핑
      // mMonth - 1 은 JS Date 객체의 month(0~11) 기준과 맞추기 위함
      if (mYear === year && mMonth - 1 === month) {
        if (!map.has(mDay)) {
          map.set(mDay, []);
        }
        map.get(mDay)!.push(meeting);
      }
    });

    return map;
  }, [meetings, year, month]); // year와 month가 바뀔 때마다 다시 계산됨

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
