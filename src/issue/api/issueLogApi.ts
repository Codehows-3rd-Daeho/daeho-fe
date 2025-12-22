import httpClient from "../../config/httpClient";

export const getIssueLog = async (issueId: string) => {
  const response = await httpClient.get(`/issue/${issueId}/log`);
  return response.data;
};
