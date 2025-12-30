//STT 조회용
export interface STT {
  id: number;
  content: string;
  summary: string;
  meetingId: string;
  isEditable: boolean;
  isLoading: boolean;
  isTemp: boolean;
}
