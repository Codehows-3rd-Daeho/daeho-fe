import httpClient from "../../config/httpClient";

export const getIssueLog = async (
  issueId: string,
  page: number,
  size: number
) => {
  const response = await httpClient.get(`/issue/${issueId}/log`, {
    params: { page, size },
  });
  return response.data;
};
