import type { FileItem } from "../component/FileList";

export interface CommentDto {
  id: number;
  writerMemberId: number;
  writerName: string;
  writerJPName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isDel: boolean;
  fileList: FileItem[];
  mentions?: Mention[];
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

export type Mention = {
  memberId: number;
  name: string;
};
