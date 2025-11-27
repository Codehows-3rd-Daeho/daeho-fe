import type { IssueListItem } from "../type/type";

export const mockIssueList: IssueListItem[] = [
  {
    id: 1,
    title: "서버 장애 관련 회의",
    status: "진행중",
    startDate: new Date("2025-01-15"),
    endDate: new Date("2025-01-16"),
    category: "장애",
    department: ["개발팀", "인프라팀"],
    isHost: "홍길동",
  },
  {
    id: 2,
    title: "프로젝트 킥오프",
    status: "완료",
    startDate: new Date("2025-01-10"),
    endDate: new Date("2025-01-11"),
    category: "프로젝트",
    department: ["기획팀"],
    isHost: "김철수",
  },
];
