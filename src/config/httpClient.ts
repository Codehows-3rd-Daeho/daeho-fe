// 전역 인터셉터
export const BASE_URL = import.meta.env.VITE_API_URL;
import axios, { AxiosError } from "axios";

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

  **필수. try-catch 백엔드 error message 사용** => 401: httpClient가 처리 
     catch (error) {
      const apiError = error as ApiError;
      if (apiError.response?.status === 401) return;     
      const response = apiError.response?.data?.message;
      alert(response ?? " ~ 중 오류가 발생했습니다.");
    }

*/

export interface ApiError extends AxiosError<{ message: string }> {
  uiMessage?: string;
}

const httpClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터: 모든 HTTP 요청에 JWT 토큰을 Authorization 헤더에 추가.
httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwt");
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 401 Unauthorized 에러 발생 시 로그인 페이지로 이동.
// 네트워크, 인증 에러만 전역으로 처리 나머지는 catch에서 alert로 처리해야합니다.
let networkAlerted = false;
let authFinalized = false; //401 error, 세션 만료 확인 => alert 중복 방지

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    //1. 네트워크 오류 확인 (서버 응답 없음 axios error)
    if (!axios.isAxiosError(error) || !error.response) {
      if (!networkAlerted) {
        networkAlerted = true;
        alert("네트워크 오류가 발생했습니다."); // alert가 연속으로 뜨는 걸 방지(중복방지)
        setTimeout(() => (networkAlerted = false), 1000); // 1초 후 다음 네트워크 오류 때는 다시 alert 가능
      }
      return Promise.reject(error);
    }

    // 2. 서버에서 error가 내려오는 경우
    const { status, data } = error.response;
    const message = data?.message ?? "오류가 발생했습니다."; //서버의 에러 메세지 추출

    console.log("data?.errorCode: ", data?.errorCode);

    if (status === 401) {
      if (authFinalized) {
        return Promise.reject(error);
      }

      authFinalized = true;
      localStorage.removeItem("jwt");

      alert(message); // 서버 메시지 그대로 사용
      window.location.replace("/login");
      return Promise.reject(error);
    }

    //3. 기타 error => 다른 alert에서 message를 받아서 사용 가능
    return Promise.reject({
      ...error,
      uiMessage: message,
    });
  }
);

export default httpClient;
