import type { FileDto } from "../../issue/type/type";

//STT 조회용
export interface STT {
  id: number;
  content: string;
  summary: string;
  meetingId: string;
  status?: "RECORDING" | "PROCESSING" | "COMPLETED";
  isEditable: boolean;
  isLoading: boolean;
  isTemp: boolean;
  file?: FileDto;
  recordingTime: number;
}
