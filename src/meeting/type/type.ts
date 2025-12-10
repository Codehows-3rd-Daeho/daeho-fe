import type { FileDto } from "../../issue/type/type";

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
  startDate: string; // 시작일
  endDate?: string; // 종료일 (선택)
  category: string; // 카테고리
  department: string[] | number[]; // 관련 부서 (다중)
  members: MeetingMemberDto[]; // 관련 멤버 (다중)
  isDel: boolean;
}

//회의 멤버 등록
export interface MeetingMemberDto {
  memberId: number;
  memberName: string;
  departmentName?: string;
  isHost: boolean;
  isPermitted: boolean;
  isRead: boolean;
}

export interface MeetingDtlDto {
  // 왼쪽
  title: string;
  content: string;
  fileList: FileDto[];

  // 오른쪽
  status: string;
  host: string; // 이름, 직급 포함
  issueId: number; // 관련 이슈
  issueTitle: string;
  startDate: string;
  endDate: string;
  categoryName: string;
  departmentName: string[];
  meetingMinutes: FileDto; // 회의록
  createdAt: string;
  updatedAt: string;
  isDel: boolean;

  isEditPermitted: boolean; // 수정/삭제 권한 여부
  participantList: MeetingMemberDto[];
}
