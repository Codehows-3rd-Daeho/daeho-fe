import type { FileDto } from "../../issue/type/type";

// 미팅 리스트 조회 타입
export type MeetingListItem = {
  id: number;
  title: string;
  status: string; // 상태
  startDate: string;
  endDate: string;
  categoryName: string; // 주제
  departmentName: string[]; // 부서
  hostName: string; // 주관자
  isDel?: boolean; // 삭제상태
  isPrivate: boolean; // 비밀글 여부
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
  departmentIds: string[]; // 관련 부서 (다중)
  members: MeetingMemberDto[]; // 관련 멤버 (다중)
  isDel: boolean;
  isPrivate?: boolean;
}

//회의 멤버 등록
export interface MeetingMemberDto {
  id: number;
  name: string;
  departmentName?: string;
  jobPositionName?: string;
  isHost: boolean;
  isPermitted: boolean;
  isRead: boolean;
}

//회의 등록시 조회하는 이슈 속성들
export interface IssueInMeeting {
  id?: string;
  title: string; // 제목
  categoryId: string; // 카테고리
  departmentIds: string[]; // 관련 부서 (다중)
  members: MeetingMemberDto[]; // 관련 멤버 (다중)
}

export interface MeetingDto {
  // 왼쪽
  title: string;
  content: string;
  fileList: FileDto[];

  // 오른쪽
  status: string;
  hostName: string;
  hostJPName: string;
  issueId: number; // 관련 이슈
  issueTitle: string;
  startDate: string;
  endDate: string;
  categoryName: string;
  departmentName: string[];
  meetingMinutes: FileDto; // 회의록
  totalSummary: string;
  createdAt: string;
  updatedAt: string;
  isDel: boolean;
  isPrivate: boolean;

  isEditPermitted: boolean; // 수정/삭제 권한 여부
  participantList: MeetingMemberDto[];
}
