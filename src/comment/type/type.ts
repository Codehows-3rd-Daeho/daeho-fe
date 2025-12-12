export interface Attachment {
  name: string;
  size: number;
  type: string;
}

export interface CommentData {
  id: number;
  author: string;
  content: string;
  timestamp: string;
  files: Attachment[];
}

export interface NewCommentPayload {
  content: string;
  files: Attachment[];
}

export type Comment = {
  id: number;
  content: string;
  writer: string;
  isDel?: boolean; // 삭제상태
};

//
export interface CommentsResponse {
  content: Comment[];
  totalElements: number;
}
