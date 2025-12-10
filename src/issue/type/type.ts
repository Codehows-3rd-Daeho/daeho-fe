// 이슈 리스트 조회 타입
export type IssueListItem = {
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

//
export interface IssueListResponse {
  content: IssueListItem[];
  totalElements: number;
}

export interface IssueFormValues {
  title: string; // 제목
  content: string; // 내용
  file?: File[]; // 첨부 파일 (다중)
  status: string; // 상태 (예: 완료 여부)
  host: string; // 작성자
  startDate: string; // 시작일
  endDate?: string; // 종료일 (선택)
  category: string; // 카테고리
  department: string[] | number[]; // 관련 부서 (다중)
  members: IssueMemberDto[]; // 관련 멤버 (다중)
  isDel?: boolean;
}

//이슈 등록시 사용, 주관자
export interface IssueMemberData {
  id: number;
  name: string;
  jobPositionName: string;
}

// 회원 리스트(참여자, 참석자 추가)
export interface PartMemberList {
  id: number;
  name: string;
  department: string;
  jobPositionName: string;
}

//이슈 참여자
export interface IssueMemberDto {
  memberId: number;
  memberName: string;
  departmentName?: string;
  isHost: boolean;
  isPermitted: boolean;
  isRead: boolean;
}

export interface IssueDtlDto {
  // 왼쪽
  title: string;
  content: string;
  fileList: FileDto[];

  // 오른쪽
  status: string;
  host: string; // 이름, 직급 포함
  startDate: string;
  endDate: string;
  categoryName: string;
  departmentName: string[];
  createdAt: string;
  updatedAt: string;
  isDel: boolean;

  isEditPermitted: boolean; // 수정/삭제 권한 여부
  participantList: IssueMemberDto[]; // 참여자 리스트
}

export interface FileDto {
  fileId: number;
  path: string;
  originalName: string;
  size: string; //단위포함
  createdAt: string;
}
