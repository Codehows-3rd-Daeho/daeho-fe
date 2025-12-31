export interface PageHeaderProps {
  currentValue: string;
  options: { label: string; value: string; path: string }[];
  addButtonPath?: string;
  addButtonLabel?: string;
}

export interface ViewToggleProps {
  options: { label: string; path: string; value: string }[]; // 버튼 레이블 + 경로 + 내부값
  currentValue: string; // 현재 선택된 값
}

export interface FilterDto {
  keyword?: string;
  startDate?: string;
  endDate?: string;
  departmentIds?: string[];
  categoryIds?: string[];
  hostIds?: string[];
  participantIds?: string[];
  statuses?: string[];
}
