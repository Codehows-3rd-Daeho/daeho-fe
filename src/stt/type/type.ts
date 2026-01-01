import type { FileDto } from "../../issue/type/type";

//STT 조회용
export interface STT {
  id: number;
  content: string;
  summary: string;
  meetingId: string;
  status?: "RECORDING" | "ENCODING" | "ENCODED" | "PROCESSING" | "SUMMARIZING" | "COMPLETED";
  progress?: number;
  isEditable: boolean;
  isLoading: boolean;
  isTemp: boolean;
  file?: FileDto;
  chunkingCnt?: number;
  memberId: number;
}

export interface ProcessingState {
  rid: string;
  status: 
  "ai_requested" | "uploaded" | "file_processing" | 
  "transcribing" | "post_processing" | "transcribed" | 
  "input_error" | "transcript_error" | "file_error";
  progress: number;
  completed: boolean;
}

export interface ProcessingStt extends ProcessingState {
  summaryRid: string;
  content: string;
}

export interface ProcessingSummary extends ProcessingState {
  title: string;
  summaryText: string;
}
