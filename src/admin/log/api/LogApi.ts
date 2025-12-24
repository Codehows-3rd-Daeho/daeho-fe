import httpClient from "../../../config/httpClient";

export const getLogList = async (page: number, size: number) => {
  const response = await httpClient.get(`/admin/log`, {
    params: { page, size },
  });
  return response.data;
};
