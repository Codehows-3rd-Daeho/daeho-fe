import axios from "axios";
import type { Login, Member, MemberList } from "../type/MemberType";
import httpClient, { BASE_URL } from "../../config/api/httpClient";

// 토큰 필요 없음.
export const loginAndGetToken = async (data: Login) => {
  const response = await axios.post(`${BASE_URL}/login`, data);
  return response.headers.authorization;
};

export const createMember = async (data: Member) => {
  const response = await httpClient.post(`/signup`, data);
  return response.data;
};

// 로그인 중복확인 토큰 필요 없음.
export const checkId = async (loginId: string) => {
  const response = await axios.get(`${BASE_URL}/signup/check_loginId`, {
    params: { loginId: loginId },
  });
  return response.data;
};

// 회원 목록 조회
export const getMemberList = async (): Promise<MemberList[]> => {
  const response = await httpClient.get(`/admin/member`, {});
  return response.data;
};
