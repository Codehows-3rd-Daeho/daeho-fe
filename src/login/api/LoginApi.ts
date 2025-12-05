import axios from "axios";
import { BASE_URL } from "../../config/httpClient";
import type { Login } from "../type/LoginType";

// 토큰 필요 없음.
export const loginAndGetToken = async (data: Login) => {
  const response = await axios.post(`${BASE_URL}/login`, data);
  return response.data;
};
