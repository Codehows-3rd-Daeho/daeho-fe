import { type GridColDef } from "@mui/x-data-grid";

export interface CommonDataGridProps<T> {
  rows: T[]; // 데이터
  columns: GridColDef[]; // 컬럼 정의
  rowIdField: keyof T; // 고유 ID 필드
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
