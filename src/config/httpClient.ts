// 전역 인터셉터
export const BASE_URL = import.meta.env.VITE_API_URL;
import axios from "axios";

/*
  사용법 안내:

  1. JWT 토큰이 필요한 API 요청:
     await httpClient.get("/member/detail");

  2. JWT 토큰이 필요 없는 API 요청:
     await axios.get(`${BASE_URL}/public/info`);

  3. multipart/form-data 요청 :
  await httpClient.post("/signup", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  **필수. try-catch에서 401 처리 안내**
     catch (error) {
       //  catch에서 인증오류 말고 다른 alert를 사용하게 된다면 아래 코드 추가.
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

// 요청 인터셉터: 모든 HTTP 요청에 JWT 토큰을 Authorization 헤더에 추가.
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
let alreadyAlerted = false;

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      if (!alreadyAlerted) {
        alreadyAlerted = true;
        sessionStorage.removeItem("jwt");
        alert("인증오류가 발생했습니다. 로그인 페이지로 이동합니다.");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default httpClient;
