import { create } from "zustand";

type AuthStore = {
  isAuthenticated: boolean; // 사용자가 인증되었는지 여부
  token: string | null; // 현재 사용자의 JWT 액세스 토큰
  loginId: string | null; // 현재 로그인한 사용자의 고유 ID (JWT에서 추출)
  role: string | null; // 현재 사용자의 권한 (ROLE_ADMIN, ROLE_USER)
  login: (token: string) => void; // 로그인 처리 함수
  logout: () => void; // 로그아웃 처리 함수
};

/**
 * @function decodeJwt
 * @description JWT(JSON Web Token)를 디코딩하여 페이로드(payload)를 파싱하는 헬퍼 함수입니다.
 *              토큰의 'sub' 클레임에서 사용자 ID를 추출하는 데 사용됩니다.
 * @param {string} token - 디코딩할 JWT 문자열
 * @returns {any | null} 디코딩된 JWT 페이로드 객체 또는 디코딩 실패 시 `null`
 */
const decodeJwt = (token: string) => {
  try {
    const base64Url = token.split(".")[1]; // JWT의 두 번째 부분(페이로드)을 가져옵니다.
    // URL-safe Base64를 일반 Base64로 변환합니다.
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    // Base64 디코딩 후 URI 컴포넌트 디코딩을 통해 JSON 문자열을 얻습니다.
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload); // JSON 문자열을 객체로 파싱하여 반환합니다.
  } catch (e) {
    console.error("Error decoding JWT:", e); // 디코딩 중 에러 발생 시 로깅
    return null;
  }
};

export const useAuthStore = create<AuthStore>((set) => {
  // 세션스토리지에 JWT가 있으면 decode해서 초기값 세팅
  const savedToken = sessionStorage.getItem("jwt");
  const decodedToken = savedToken ? decodeJwt(savedToken) : null;

  return {
    isAuthenticated: !!savedToken,
    token: savedToken,
    loginId: decodedToken ? decodedToken.sub : null,
    role: decodedToken ? decodedToken.role.replace(/^ROLE_/, "") : null, // "ROLE_"접두어 제거
    login: (token: string) => {
      sessionStorage.setItem("jwt", token);

      const decodedToken = decodeJwt(token);
      const loginId = decodedToken ? decodedToken.sub : null;
      const role = decodedToken
        ? decodedToken.role.replace(/^ROLE_/, "")
        : null;
      set({ token, isAuthenticated: true, loginId, role });
    },
    logout: () => {
      sessionStorage.removeItem("jwt");
      set({
        isAuthenticated: false,
        token: null,
        loginId: null,
        role: null,
      });
    },
  };
});
