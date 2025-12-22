export interface NotificationType {
  senderName: string;
  message: string;
  forwardUrl: string;
  //   isRead: boolean;
  createdAt: string;
}

export interface NotificationPage {
  content: NotificationType[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  last: boolean;
}
