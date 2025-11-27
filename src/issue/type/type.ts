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

export interface BaseFormValues {
  title: string; // 제목
  content: string; // 내용
  file?: File[]; // 첨부 파일 (다중)
  status: string; // 상태 (예: 완료 여부)
  host: string; // 작성자
  startDate: string; // 시작일
  endDate?: string; // 종료일 (선택)
  category: string; // 카테고리
  department: string[] | number[]; // 관련 부서 (다중)
  member: string[]; // 관련 멤버 (다중)
}
