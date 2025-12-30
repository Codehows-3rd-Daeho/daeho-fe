import httpClient from "../../config/httpClient";
import type { NotificationPage } from "../type";

export const getMyNotifications = async (
  page: number,
  size = 5
): Promise<NotificationPage> => {
  const res = await httpClient.get("/notifications", {
    params: { page, size },
  });
  return res.data;
};

// 알림 읽음
export const readNotification = async (id: number) => {
  const res = await httpClient.patch(`notifications/${id}/read`);
  return res.data;
};

// 안읽은 알림 개수
export const getUnreadNotificationCount = async (): Promise<number> => {
  const res = await httpClient.get("/notifications/unread-count");
  return res.data;
};
