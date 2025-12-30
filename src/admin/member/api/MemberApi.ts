import type { Member, MemberList, MemberProfile } from "../type/MemberType";
import httpClient from "../../../config/httpClient";
import type { PageResponse } from "../../../common/List/type";
import type { PartMemberList } from "../../../issue/type/type";

export const createMember = async (formData: FormData) => {
  const response = await httpClient.post("/signup", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

//아이디 중복 확인
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

// 회원 상세 조회(마이페이지)
export const getMemberProfile = async (id: number): Promise<MemberProfile> => {
  const response = await httpClient.get<MemberProfile>(`/mypage/${id}`);
  return response.data;
};

//비밀번호 제설정(로그인 기반으로 사용자정보 꺼낼 예정(for 보안) => id 필요 x )
export const changePassword = async (newPassword: string) => {
  const response = await httpClient.patch("/mypage/password", {
    newPassword,
  });
  return response.data;
};
