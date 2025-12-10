import { create } from "zustand";
type AuthStore = {
  isAuthenticated: boolean; // 사용자가 인증되었는지 여부
  token: string | null; // 현재 사용자의 JWT 액세스 토큰
  member: MemberInfo | null;
  login: (token: string, user: MemberInfo) => void; // 로그인 처리 함수
  logout: () => void; // 로그아웃 처리 함수
};

type MemberInfo = {
  memberId: number;
  name: string;
  jobPosition: string;
  role: string;
};

export const useAuthStore = create<AuthStore>((set) => {
  const savedToken = localStorage.getItem("jwt");
  const savedMember = localStorage.getItem("member");

  return {
    isAuthenticated: !!savedToken,
    token: savedToken,
    member: savedMember ? JSON.parse(savedMember) : null,

    login: (token, member) => {
      localStorage.setItem("jwt", token);
      localStorage.setItem("member", JSON.stringify(member));
      set({ token, isAuthenticated: true, member });
    },
    logout: () => {
      localStorage.removeItem("jwt");
      localStorage.removeItem("member");
      set({
        isAuthenticated: false,
        token: null,
        member: null,
      });
    },
  };
});
