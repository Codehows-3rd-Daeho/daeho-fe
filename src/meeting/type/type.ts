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

export interface MeetingListResponse {
  content: MeetingListItem[];
  totalElements: number;
}

export interface MeetingFormValues {
  title: string; // 제목
  content: string; // 내용
  file?: File[]; // 첨부 파일 (다중)
  status: string; // 상태 (예: 완료 여부)
  host: string; // 작성자
  issue: string; // 관련 이슈
  startDate: string; // 시작일
  endDate?: string; // 종료일 (선택)
  categoryId: string; // 카테고리
  departmentIds: string[] | number[]; // 관련 부서 (다중)
  members: MeetingMemberDto[]; // 관련 멤버 (다중)
  isDel: boolean;
}

//회의 멤버 등록
export interface MeetingMemberDto {
  memberId: number;
  memberName: string;
  isHost: boolean;
  isPermitted: boolean;
  isRead: boolean;
}

//회의 등록시 조회하는 이슈 속성들
export interface IssueInMeeting {
  id?: string;
  title: string; // 제목
  categoryId: string; // 카테고리
  departmentIds: string[] | number[]; // 관련 부서 (다중)
  members: MeetingMemberDto[]; // 관련 멤버 (다중)
}
