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
