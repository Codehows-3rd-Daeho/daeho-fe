import axios, { type AxiosRequestConfig } from "axios";
import type { Login, Member } from "../type/MemberType";
import { BASE_URL } from "../../config/BaseUrl";

export const checkId = async (loginId: string) => {
  const response = await axios.get(`${BASE_URL}/signup/check_loginId`, {
    params: { loginId: loginId },
  });
  return response.data;
};

export const createMember = async (data: Member) => {
  const response = await axios.post(
    `${BASE_URL}/signup`,
    data,
    getAxiosAuthHeaders()
  );
  return response.data;
};

export const loginAndGetToken = async (data: Login) => {
  const response = await axios.post(`${BASE_URL}/login`, data);
  return response.headers.authorization;
};

export const getAxiosAuthHeaders = (): AxiosRequestConfig => {
  const token = sessionStorage.getItem("jwt");
  return {
    headers: {
      Authorization: token || "",
    },
  };
};
