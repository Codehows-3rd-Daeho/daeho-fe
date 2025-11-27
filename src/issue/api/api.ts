import axios from "axios";
import type { IssueListResponse } from "../type/type";

// 이슈 목록 조회
export const getIssueList = async (
  page: number,
  size: number = 10
): Promise<IssueListResponse> => {
  const response = await axios.get(`/api/issue`, {
    params: { page, size },
  });
  return response.data; // { content, totalElements }
};
