import axios, { type AxiosRequestConfig } from "axios";
import type { Login, Member } from "../type/MemberType";
import { BASE_URL } from "../../config/BaseUrl";
import type { IssueMemberData, PartMemberList } from "../../issue/type/type";

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

//멤버 리스트(참여자, 참석자)
export const getPartMemberList = async (): Promise<PartMemberList[]> => {
  const response = await axios.get(
    `${BASE_URL}/partMember/list`,
    getAxiosAuthHeaders()
  );
  console.log("getPartMemberList response:", response.data);
  return response.data;
};

//주관자 정보
//아이디를 보내서, 이름, 직급 조회
export const getHostData = async (
  memberId: number
): Promise<IssueMemberData> => {
  const response = await axios.get(
    `${BASE_URL}/partMember/${memberId}`,
    getAxiosAuthHeaders()
  );
  console.log("getHostData response:", response.data);
  return response.data;
};
