import httpClient from "../../../config/httpClient";
import type { GetLogListParams } from "../type/type";

export const getLogList = async (page: number, size: number, type?: string) => {
  const params: GetLogListParams = { page, size };
  if (type && type !== "ALL") params.targetType = type; // ALL이면 생략
  const response = await httpClient.get(`/admin/log`, { params });
  return response.data;
};
