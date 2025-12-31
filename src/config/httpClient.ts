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
let alreadyAlerted = false;
let networkAlerted = false;

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 네트워크 오류 (서버 응답 없음)
    if (!axios.isAxiosError(error) || !error.response) {
      if (!networkAlerted) {
        // alert가 연속으로 뜨는 걸 방지(중복방지)
        networkAlerted = true;
        alert("네트워크 오류가 발생했습니다.");
        // 1초 후 다음 네트워크 오류 때는 다시 alert 가능
        setTimeout(() => (networkAlerted = false), 1000);
      }
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    //서버의 에러 메세지 추출
    const message =
      (data as { message?: string })?.message ?? "오류가 발생했습니다.";

    // 인증 에러
    if (status === 401) {
      if (!alreadyAlerted) {
        alreadyAlerted = true;
        // localStorage.removeItem("jwt");
        alert(message);
        // window.location.href = "/login";
      }
    }

    //다른 alert에서 message를 받아서 사용 가능
    return Promise.reject({
      ...error,
      uiMessage: message,
    });
  }
);

export default httpClient;
