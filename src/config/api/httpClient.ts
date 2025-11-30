// 전역 인터셉터
export const BASE_URL = import.meta.env.VITE_API_URL;
import axios from "axios";

/*
  사용법 안내:

  1. JWT 토큰이 필요한 API 요청:
     await httpClient.get("/member/detail");

  2. JWT 토큰이 필요 없는 API 요청:
     await axios.get(`${BASE_URL}/public/info`);

  3. try-catch에서 401 처리 안내:

     catch (error) {
       // 전역 인터셉터가 이미 401 인증 오류를 처리하므로, 일반적으로는 아래 코드를 추가하지 않아도 됨

       //  단, catch에서 인증 말고 다른 alert를 사용하게 된다면 아래 코드 추가.
       if (axios.isAxiosError(error) && error.response?.status === 401) {
         return;
       }
       // 다른 alert
       alert("~~ 중 오류가 발생했습니다.");
     }
*/
const httpClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터: 모든 HTTP 요청에 JWT 토큰을을 Authorization 헤더에 추가.
httpClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("jwt");
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 401 Unauthorized 에러 발생 시 로그인 페이지로 이동.
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem("jwt");
      alert("인증 오류가 발생했습니다. 다시 로그인해주세요");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default httpClient;
