import type { Member, MemberList } from "../type/MemberType";
import httpClient from "../../../config/httpClient";
import type { PageResponse } from "../../../common/List/type";
import type { IssueMemberData, PartMemberList } from "../../../issue/type/type";

export const createMember = async (formData: FormData) => {
  const response = await httpClient.post("/signup", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
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
export const updateMember = async (id: number, formData: FormData) => {
  const response = await httpClient.put(`/admin/member/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

//멤버 리스트(참여자, 참석자)
export const getPartMemberList = async (): Promise<PartMemberList[]> => {
  const response = await httpClient.get(`/partMember/list`);
  console.log("getPartMemberList response:", response.data);
  return response.data;
};

//주관자 정보
//아이디를 보내서, 이름, 직급 조회
export const getHostData = async (
  memberId: number
): Promise<IssueMemberData> => {
  const response = await httpClient.get(`/partMember/${memberId}`);
  console.log("getHostData response:", response.data);
  return response.data;
};
