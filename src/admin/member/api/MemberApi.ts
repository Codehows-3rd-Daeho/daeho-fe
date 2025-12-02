import type { Member, MemberList } from "../type/MemberType";
import httpClient from "../../../config/httpClient";
import type { PageResponse } from "../../../common/List/type";

export const createMember = async (data: Member) => {
  const response = await httpClient.post(`/signup`, data);
  return response.data;
};

export const checkId = async (loginId: string) => {
  const response = await httpClient.get(`/signup/check_loginId`, {
    params: { loginId: loginId },
  });
  return response.data;
};

// 회원 목록 조회
export const getMemberList = async (
  page: number,
  size: number
): Promise<PageResponse<MemberList>> => {
  const response = await httpClient.get<PageResponse<MemberList>>(
    `/admin/member`,
    {
      params: { page, size },
    }
  );
  return response.data;
};

// 회원 상세 조회
export const getMemberDtl = async (id: number): Promise<Member> => {
  const response = await httpClient.get<Member>(`/admin/member/${id}`);
  return response.data;
};

// 임시 비밀번호 생성
export const generatePwd = async (id: number) => {
  const response = await httpClient.post(`/admin/member/${id}/generatePwd`);
  return response.data;
};

// 회원 수정
export const updateMember = async (
  id: number,
  data: Member
): Promise<Member> => {
  const response = await httpClient.put(`/admin/member/${id}`, data);
  return response.data;
};
