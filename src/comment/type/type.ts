import type { FileItem } from "../component/FileList";

export interface CommentDto {
  id: number;
  writerName: string;
  writerJPName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isDel: boolean;
  fileList: FileItem[];
}

export interface CommentsResponse {
  content: CommentDto[];
  totalElements: number;
}

export interface MentionMemberDto {
  id: number;
  name: string;
  jobPositionName: string;
  departmentName: string;
}
