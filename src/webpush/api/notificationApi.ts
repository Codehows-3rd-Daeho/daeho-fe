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
