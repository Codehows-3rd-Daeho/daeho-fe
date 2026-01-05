/**
 * @file usePushNotification.ts
 * @description 웹 푸시 알림 기능을 관리하는 커스텀 React 훅입니다.
 *              iOS Safari 푸시 알림 지원을 포함하여 개선되었습니다.
 */

import { useState, useEffect, useCallback } from "react";
import { registerPushSubscription } from "./api/pushApi";

/************************************************************
 * 1️. 상태 정의 (State & Interface)
 ************************************************************/

interface PushNotificationState {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  subscription: PushSubscription | null;
  error: string | null;
}

interface PushNotificationActions {
  requestPermission: () => Promise<boolean>;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  clearError: () => void;
}

/************************************************************
 * 2️. 브라우저 지원 여부 체크
 ************************************************************/
const isPushSupported = () =>
  "serviceWorker" in navigator && "PushManager" in window;

/************************************************************
 * 3️. VAPID Key 변환 헬퍼 함수 (iOS 필수!)
 ************************************************************/
/**
 * @function urlBase64ToUint8Array
 * @description Base64로 인코딩된 VAPID Public Key를 Uint8Array로 변환합니다.
 *              iOS Safari는 문자열 형식의 VAPID 키를 받지 않으므로 반드시 필요합니다.
 * @param {string} base64String - Base64 인코딩된 VAPID Public Key
 * @returns {Uint8Array} 변환된 Uint8Array
 */
const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray as Uint8Array;
};

/**
 * @hook usePushNotification
 * @description 웹 푸시 알림 기능을 관리하는 커스텀 React 훅입니다.
 *              iOS Safari를 포함한 모든 브라우저에서 작동하도록 개선되었습니다.
 */
export const usePushNotification = (
  memberId: string
): PushNotificationState & PushNotificationActions => {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: "default",
    isSubscribed: false,
    subscription: null,
    error: null,
  });

  /************************************************************
   * 4️. 권한 요청 함수
   ************************************************************/
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isPushSupported()) {
      setState((prev) => ({
        ...prev,
        error: "푸시 알림을 지원하지 않는 브라우저입니다.",
      }));
      console.log("푸시 알림을 지원하지 않는 브라우저입니다.");
      return false;
    }

    // 차단된 상태
    if (Notification.permission === "denied") {
      alert(
        "브라우저 알림이 차단되어 있습니다.\n\n" +
          "주소창 왼쪽 🔒 아이콘 → 사이트 설정 → 알림을 허용해 주세요."
      );
      return false;
    }

    // 이미 허용된 경우
    if (Notification.permission === "granted") {
      setState((prev) => ({ ...prev, permission: "granted" }));
      console.log("푸시 알림이 이미 허용되어 있습니다.");
      return true;
    }

    try {
      console.log("푸시 권한을 요청합니다");
      const permission = await Notification.requestPermission();
      console.log("권한 응답:", permission);
      setState((prev) => ({ ...prev, permission }));
      
      if (permission === "granted") {
        return true;
      }
      
      setState((prev) => ({
        ...prev,
        error: "푸시 알림 권한이 거부되었습니다.",
      }));
      return false;
    } catch (error) {
      console.error("Permission request failed:", error);
      setState((prev) => ({ ...prev, error: "권한 요청에 실패했습니다." }));
      return false;
    }
  }, []);

  /************************************************************
   * 5️. 구독 함수 (iOS 호환성 개선)
   ************************************************************/
  const subscribe = useCallback(async (): Promise<boolean> => {
    try {
      console.log("서비스 워커 준비 대기 중...");
      const registration = await navigator.serviceWorker.ready;
      console.log("서비스 워커 준비 완료");

      // 기존 구독 확인
      const existingSub = await registration.pushManager.getSubscription();
      if (existingSub) {
        console.log("기존 구독이 존재합니다:", existingSub);
        setState((prev) => ({
          ...prev,
          isSubscribed: true,
          subscription: existingSub,
          error: null,
        }));
        return true;
      }

      // VAPID 키 가져오기
      const vapidPublicKey = import.meta.env.VITE_APP_VAPID_PUBLIC_KEY;
      
      if (!vapidPublicKey) {
        throw new Error("VAPID Public Key가 설정되지 않았습니다.");
      }

      console.log("VAPID Key 변환 중...");
      // iOS 필수: VAPID 키를 Uint8Array로 변환
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
      console.log("VAPID Key 변환 완료");

      console.log("푸시 구독 시도 중...");
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as BufferSource, // 타입 단언 추가
      });

      console.log("푸시 구독 성공:", subscription);
      setState((prev) => ({
        ...prev,
        isSubscribed: true,
        subscription,
        error: null,
      }));
      return true;
    } catch (error) {
      console.error("Subscription failed:", error);
      // 더 자세한 에러 정보 로깅
      if (error instanceof Error) {
        console.error("에러 메시지:", error.message);
        console.error("에러 스택:", error.stack);
      }
      setState((prev) => ({ 
        ...prev, 
        error: `푸시 구독에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}` 
      }));
      return false;
    }
  }, []);

  /************************************************************
   * 6️. 초기화 (컴포넌트 마운트 시)
   ************************************************************/
  useEffect(() => {
    const initialize = async () => {
      if (!memberId) {
        console.log("memberId가 없어 초기화를 건너뜁니다.");
        return;
      }

      console.log("푸시 알림 초기화 시작, memberId:", memberId);

      // 1. 푸시 알림 지원 여부 확인
      if (!isPushSupported()) {
        console.log("푸시 알림을 지원하지 않는 브라우저입니다.");
        setState((prev) => ({
          ...prev,
          isSupported: false,
          error: "Push notifications are not supported.",
        }));
        return;
      }

      // 2. 지원하는 경우
      console.log("푸시 알림 지원 확인됨");
      setState((prev) => ({
        ...prev,
        isSupported: true,
        permission: Notification.permission,
      }));

      try {
        const registration = await navigator.serviceWorker.ready;
        console.log("서비스 워커 등록 상태:", registration);
        
        const existingSubscription = await registration.pushManager.getSubscription();
        console.log("기존 구독 정보:", existingSubscription);

        if (existingSubscription) {
          setState((prev) => ({
            ...prev,
            isSubscribed: true,
            subscription: existingSubscription,
          }));
        } else {
          const currentPermission = Notification.permission;
          console.log("현재 알림 권한:", currentPermission);
          
          setState((prev) => ({
            ...prev,
            isSupported: true,
            permission: currentPermission,
          }));

          if (currentPermission === "default") {
            console.log("권한 요청 시작...");
            const isGranted = await requestPermission();
            if (isGranted) {
              console.log("권한 허용됨, 구독 시작...");
              await subscribe();
            }
          } else if (currentPermission === "granted") {
            console.log("이미 권한 허용됨, 구독 시작...");
            await subscribe();
          }
        }
      } catch (error) {
        console.error("초기화 중 에러 발생:", error);
      }
    };

    initialize();
  }, [memberId, requestPermission, subscribe]);

  /************************************************************
   * 7️. subscription 변경 시 - 구독 정보 서버 등록
   ************************************************************/
  useEffect(() => {
    if (state.subscription && state.isSubscribed) {
      const alreadyRegistered = localStorage.getItem("pushRegistered");
      if (alreadyRegistered) {
        console.log("이미 서버에 등록된 구독입니다.");
        return;
      }

      const sendSubscriptionToServer = async () => {
        try {
          console.log("서버에 구독 정보 전송 중...");
          
          const p256dhKey = state.subscription!.getKey("p256dh");
          const authKey = state.subscription!.getKey("auth");

          if (!p256dhKey || !authKey) {
            throw new Error("구독 키를 가져올 수 없습니다.");
          }

          const subscriptionData = {
            endpoint: state.subscription!.endpoint,
            keys: {
              p256dh: btoa(String.fromCharCode(...new Uint8Array(p256dhKey))),
              auth: btoa(String.fromCharCode(...new Uint8Array(authKey))),
            },
          };

          console.log("구독 데이터:", subscriptionData);
          await registerPushSubscription(subscriptionData);
          localStorage.setItem("pushRegistered", "true");
          console.log("푸시 구독 정보가 서버에 등록되었습니다.");
        } catch (error) {
          console.error("서버에 구독 정보 전송 실패:", error);
          setState((prev) => ({
            ...prev,
            error: "서버 등록에 실패했습니다.",
          }));
        }
      };

      sendSubscriptionToServer();
    }
  }, [state.subscription, state.isSubscribed]);

  /************************************************************
   * 8️. 구독 해제 함수
   ************************************************************/
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!state.subscription) {
      return false;
    }

    try {
      await state.subscription.unsubscribe();
      setState((prev) => ({
        ...prev,
        isSubscribed: false,
        subscription: null,
        error: null,
      }));
      localStorage.removeItem("pushRegistered");
      console.log("구독 해제 완료");
      return true;
    } catch (error) {
      console.error("Unsubscription failed:", error);
      setState((prev) => ({ ...prev, error: "구독 해제에 실패했습니다." }));
      return false;
    }
  }, [state.subscription]);

  /************************************************************
   * 9️. 에러 초기화 함수
   ************************************************************/
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  /************************************************************
   * 10. 훅 반환
   ************************************************************/
  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe,
    clearError,
  };
};