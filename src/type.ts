// type.ts

export interface BaseFormValues {
  title: string; // 제목
  content: string; // 내용
  file: File[]; // 첨부 파일 (다중)
  status: string; // 상태 (예: 완료 여부)
  createdBy: string; // 작성자
  startDate: string; // 시작일
  endDate?: string; // 종료일 (선택)
  category: string; // 카테고리
  department: string[]; // 관련 부서 (다중)
  member: string[]; // 관련 멤버 (다중)
  onSubmit?: () => Promise<void>; // 제출 시 호출되는 함수
}
