// type.ts

export interface BaseFormValues {
  title: string; // 제목
  content: string; // 내용
  file?: File[]; // 첨부 파일 (다중)
  status: string; // 상태 (예: 완료 여부)
  host: string; // 작성자
  startDate: string; // 시작일
  endDate?: string; // 종료일 (선택)
  category?: string; // 카테고리
  department: string[]; // 관련 부서 (다중)
  member: string[]; // 관련 멤버 (다중)
}

//등록시에 사용되지 않음. DB에서 읽어오는 용
export interface FileInfo {
  fileId?: number;
  path: string;
  originalName: string;
  savedName: string;
  size: number;
  targetId: number;
  targetType: "issue" | "meeting" | "comment" | "stt";
}
