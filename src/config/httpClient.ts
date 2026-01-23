import axios, { AxiosError } from "axios";
export const BASE_URL = import.meta.env.VITE_API_URL;
/**
 * @file httpClient.ts
 * @description Axios 인스턴스를 생성하고, JWT 인증 토큰 및 전역 에러 처리를 위한 인터셉터를 설정합니다.
 */

/**
 * 서버에서 반환하는 표준 에러 응답 외에 UI에서 사용할 사용자 친화적 메시지를 추가하기 위해 AxiosError를 확장합니다.
 * @interface ApiError
 * @property {string} [uiMessage] - API 호출부의 catch 블록에서 사용자에게 표시할 수 있는 에러 메시지.
 */
export interface ApiError extends AxiosError<{ message: string }> {
  uiMessage?: string;
}

/**
 * 프로젝트 전역에서 사용될 기본 Axios 인스턴스.
 * 모든 요청은 `VITE_API_URL`을 baseURL로 사용합니다.
 */
const httpClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * 요청 인터셉터 (Request Interceptor)
 * - 모든 HTTP 요청이 서버로 전송되기 전에 가로챕니다.
 * - localStorage에서 'jwt' 토큰을 읽어와 Authorization 헤더에 'Bearer {token}' 형태로 추가합니다.
 * - 이를 통해 모든 httpClient 요청에 자동으로 인증 정보가 포함됩니다.
 */
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

let networkAlerted = false;
let authFinalized = false; // 401 에러 발생 시 중복 알림 및 리디렉션을 방지하기 위한 플래그

/**
 * 응답 인터셉터 (Response Interceptor)
 * - 서버로부터 응답을 받은 후, then 또는 catch로 처리되기 전에 응답을 가로챕니다.
 * - 전역적으로 처리해야 할 에러(네트워크 오류, 401 인증 만료 등)를 여기서 관리합니다.
 */
httpClient.interceptors.response.use(
  (response) => response, // 성공적인 응답은 그대로 통과시킵니다.
  (error) => {
    // 1. 네트워크 오류 처리 (서버로부터 응답이 아예 없는 경우)
    if (!axios.isAxiosError(error) || !error.response) {
      if (!networkAlerted) {
        networkAlerted = true;
        alert("서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.");
        setTimeout(() => (networkAlerted = false), 3000); // 3초간 중복 알림 방지
      }
      return Promise.reject(error);
    }

    // 2. 서버에서 에러 응답이 온 경우 (e.g., 4xx, 5xx)
    const { status, data } = error.response;
    const message = data?.message ?? "알 수 없는 오류가 발생했습니다.";

    // 2-1. 401 Unauthorized (인증 실패 또는 토큰 만료)
    if (status === 401) {
      // authFinalized 플래그를 사용하여 여러 API 호출에서 401이 동시 발생해도 한 번만 처리하도록 보장
      if (authFinalized) {
        return Promise.reject(error);
      }
      authFinalized = true;
      localStorage.removeItem("jwt");
      localStorage.removeItem("member");

      alert(message);
      window.location.replace("/login"); // 페이지를 새로고침하며 이동하여 관련 상태를 모두 초기화
      return Promise.reject(error);
    }

    // 3. 그 외 서버 에러 (403, 404, 500 등)
    // 에러 객체를 확장하여 `uiMessage`를 추가합니다.
    // 이를 통해 각 API 호출부의 catch 블록에서 사용자에게 표시할 적절한 메시지를 쉽게 사용할 수 있습니다.
    const customError: ApiError = {
      ...error,
      uiMessage: message,
    };
    return Promise.reject(customError);
  }
);

export default httpClient;
