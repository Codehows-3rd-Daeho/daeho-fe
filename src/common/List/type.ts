import { type GridColDef } from "@mui/x-data-grid";

export interface CommonDataGridProps<T> {
  title?: string; // 상단 제목
  rows: T[]; // 데이터
  columns: GridColDef[]; // 컬럼 정의
  rowIdField: keyof T; // 고유 ID 필드
  onRowDelete?: (row: T) => void; // 행 삭제 시 콜백
}
