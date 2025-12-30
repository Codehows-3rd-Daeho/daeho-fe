/**
 * @file pushApi.ts
 * @description 푸시 구독 등록 및 테스트 푸시 알림 전송 기능을 제공합니다.
 */

import httpClient from "../../config/httpClient";

/**
 * @interface PushTokenData
 * @description 푸시 토큰 정보를 정의하는 인터페이스입니다.
 *              (현재 사용되지 않지만, 향후 확장성을 위해 정의되어 있습니다.)
 */
export interface PushTokenData {
  token: string; // 디바이스 푸시 토큰
  deviceInfo: {
    userAgent: string; // 사용자 에이전트 문자열
    platform: string; // 운영체제 플랫폼
    language?: string; // 언어 (선택 사항)
    timezone?: string; // 시간대 (선택 사항)
  };
}

/**
 * @interface PushTokenResponse
 * @description 푸시 토큰 관련 API 응답 형식을 정의하는 인터페이스입니다.
 */
export interface PushTokenResponse {
  success: boolean; // 요청 성공 여부
  message: string; // 응답 메시지
  tokenId?: string; // 토큰 ID (선택 사항)
}

/**
 * @interface PushSubscriptionData
 * @description Web Push 구독 정보를 정의하는 인터페이스입니다.
 *              서비스 워커에서 생성된 구독 객체의 핵심 정보들을 포함합니다.
 */
export interface PushSubscriptionData {
  endpoint: string; // 푸시 서비스 엔드포인트 URL
  keys: {
    // 암호화 키 정보
    p256dh: string; // P-256 elliptic curve Diffie-Hellman 공개 키 (Base64 인코딩)
    auth: string; // 인증 비밀 키 (Base64 인코딩)
  };
}

/**
 * @async
 * @function registerPushSubscription
 * @description 클라이언트의 푸시 구독 정보를 백엔드 서버에 등록합니다.
 *              사용자 ID는 백엔드에서 JWT를 통해 자동으로 추출됩니다.
 *
 * @param {PushSubscriptionData} data - 서버에 등록할 푸시 구독 정보 객체입니다.
 * @returns {Promise<PushTokenResponse>} - 서버로부터의 응답 데이터를 포함하는 Promise입니다.
 * @throws {Error} - API 요청 실패 시 에러를 던집니다.
 */
export const registerPushSubscription = async (
  data: PushSubscriptionData
): Promise<PushTokenResponse> => {
  try {
    // `/push/subscribe` 엔드포인트로 POST 요청을 보냅니다.
    // data 객체에서 memberId를 제거하고 나머지 데이터만 전송합니다.
    const { ...postData } = data;
    const response = await httpClient.post<PushTokenResponse>(
      "/push/subscribe",
      postData
    );
    return response.data; // 서버 응답 데이터를 반환합니다.
  } catch (error) {
    console.error("Failed to register push subscription:", error); // 에러 로깅
    throw new Error("푸시 구독 등록에 실패했습니다."); // 사용자 친화적인 에러 메시지 던지기
  }
};
