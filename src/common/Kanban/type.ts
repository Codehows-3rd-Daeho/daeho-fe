import type { IssueListItem } from "../../issue/type/type";

export type KanbanIssue = IssueListItem;

// export interface KanbanIssue {
//   id: string | number;
//   title: string;
//   status?: string;
//   statusColor?: string;
//   [key: string]: any; // 확장 가능
// }

export interface KanbanColumnDef {
  key: string;
  title: string;
}

export interface KanbanBoardProps {
  columns: KanbanColumnDef[];
  issues: Record<string, KanbanIssue[]>;
  onClickIssue?: (issue: KanbanIssue) => void;
}

export type KanbanColumnProps = {
  title: string;
  issues: KanbanIssue[];
  hasMore: boolean;
  onLoadMore: () => void;
  onClickIssue?: (issue: KanbanIssue) => void;
};
