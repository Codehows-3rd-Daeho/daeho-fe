import httpClient from "../../config/httpClient";

export const getMeetingLog = async (
  meetingId: string,
  page: number,
  size: number
) => {
  const response = await httpClient.get(`/meeting/${meetingId}/log`, {
    params: { page, size },
  });
  return response.data;
};
