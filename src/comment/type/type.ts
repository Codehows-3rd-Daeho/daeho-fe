export interface CommentDto {
  id: number;
  writerName: string;
  writerJPName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isDel: boolean;
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
