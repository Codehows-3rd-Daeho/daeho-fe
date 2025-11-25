// 미팅 리스트 조회 타입
export type MeetingListItem = {
  id: number;
  title: string;
  status: string; // 상태
  startDate: Date;
  endDate: Date;
  category: string; // 주제
  department: string[]; // 부서
  isHost: string; // 주관자
  isDel?: boolean; // 삭제상태
};
