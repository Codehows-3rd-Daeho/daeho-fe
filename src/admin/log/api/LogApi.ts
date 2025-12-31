import httpClient from "../../../config/httpClient";

export const getLogList = async (page: number, size: number, type?: string) => {
  const params: any = { page, size };
  if (type && type !== "ALL") params.targetType = type; // ALL이면 생략
  const response = await httpClient.get(`/admin/log`, { params });
  return response.data;
};
