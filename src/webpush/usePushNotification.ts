/**
 * @file usePushNotification.ts
 * @description 웹 푸시 알림 기능을 관리하는 커스텀 React 훅입니다.
 *              브라우저의 푸시 알림 지원 여부 확인, 알림 권한 관리, 푸시 서비스 구독 및 해지,
 *              그리고 관련 상태(구독 객체, 에러)를 관리합니다.
 *              서버에 푸시 구독 정보를 등록하는 로직도 이 훅 내부에 포함되어 응집도를 높였습니다.
 */

import { useState, useEffect, useCallback } from "react";
import { registerPushSubscription } from "./api/pushApi";

/************************************************************
 * 1️. 상태 정의 (State & Interface)
 ************************************************************/

/**
 * @interface PushNotificationState
 * @description 푸시 알림 기능의 현재 상태를 정의하는 인터페이스입니다.
 */
interface PushNotificationState {
  isSupported: boolean; // 브라우저가 푸시 알림을 지원하는지 여부
  permission: NotificationPermission; // 현재 알림 권한 상태 ('granted', 'denied', 'default')
  isSubscribed: boolean; // 푸시 알림에 구독되어 있는지 여부
  subscription: PushSubscription | null; // 현재 푸시 구독 객체 (없으면 null)
  error: string | null; // 발생한 에러 메시지 (없으면 null)
}

/**
 * @interface PushNotificationActions
 * @description 푸시 알림 기능과 관련된 액션 함수들을 정의하는 인터페이스입니다.
 */
interface PushNotificationActions {
  requestPermission: () => Promise<boolean>; // 사용자에게 알림 권한을 요청하는 비동기 함수
  subscribe: () => Promise<boolean>; // 푸시 알림 서비스에 구독하는 비동기 함수
  unsubscribe: () => Promise<boolean>; // 푸시 알림 구독을 해지하는 비동기 함수
  clearError: () => void; // 현재 에러 상태를 초기화하는 함수
}

/************************************************************
 * 2️. 브라우저 지원 여부 체크
 ************************************************************/
/**
 * @function isPushSupported
 * @description 현재 브라우저가 서비스 워커와 푸시 알림 API를 지원하는지 확인하는 헬퍼 함수입니다.
 * @returns {boolean} 푸시 알림 지원 여부
 */
const isPushSupported = () =>
  "serviceWorker" in navigator && "PushManager" in window;

/**
 * @hook usePushNotification
 * @description 웹 푸시 알림 기능을 관리하는 커스텀 React 훅입니다.
 *              브라우저의 푸시 알림 지원 여부 확인, 알림 권한 관리, 푸시 서비스 구독 및 해지,
 *              그리고 관련 상태(구독 객체, 에러)를 관리합니다.
 *              `memberId`를 인자로 받아 서버에 구독 정보를 등록할 때 사용합니다.
 *
 * @param {string} memberId - 현재 사용자의 고유 ID. 서버에 구독 정보를 등록할 때 사용됩니다.
 * @returns {PushNotificationState & PushNotificationActions}
 *          푸시 알림의 현재 상태와 관련 액션 함수들을 포함하는 객체
 */
export const usePushNotification = (
  memberId: string
): PushNotificationState & PushNotificationActions => {
  /**
   * @property {PushNotificationState} state
   * @description 푸시 알림 관련 상태를 관리하는 React의 `useState` 훅입니다.
   */
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: "default",
    isSubscribed: false,
    subscription: null,
    error: null,
  });

  /************************************************************
   * 3. 권한 요청 함수
   *
   * @function requestPermission
   * @description 사용자에게 알림 권한을 요청하는 비동기 함수입니다.
   *              권한 요청 결과에 따라 상태를 업데이트합니다.
   * @returns {Promise<boolean>} 권한 요청 성공 여부 (granted: true, denied/default: false)
   */
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

    // 이미 허용된 경우 다시 요청하지 않음
    if (Notification.permission === "granted") {
      setState((prev) => ({ ...prev, permission: "granted" }));
      console.log("푸시 알림이 허용되어 있습니다.");
      return true;
    }

    try {
      console.log("푸시 권한을 요청합니다");
      const permission = await Notification.requestPermission(); // 권한 요청
      console.log(permission);
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
   * 4. 구독 함수
   ************************************************************/
  /**
   * @function subscribe
   * @description 푸시 알림 서비스에 구독을 요청하는 비동기 함수입니다.
   *              성공 시 구독 객체를 상태에 저장합니다.
   * @returns {Promise<boolean>} 구독 성공 여부
   */
  const subscribe = useCallback(async (): Promise<boolean> => {
    try {
      const registration = await navigator.serviceWorker.ready; //서비스워커 준비대기
      console.log("subscribe 구독합니다.");
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true, // 사용자에게 항상 알림이 표시되도록 설정
        applicationServerKey: import.meta.env.VITE_APP_VAPID_PUBLIC_KEY, // VAPID 공개 키
      });

      setState((prev) => ({
        ...prev,
        isSubscribed: true,
        subscription,
        error: null,
      }));
      return true;
    } catch (error) {
      console.error("Subscription failed:", error);
      setState((prev) => ({ ...prev, error: "푸시 구독에 실패했습니다." }));
      return false;
    }
  }, []); // `permission` 상태가 변경될 때마다 이 함수를 재생성합니다.

  /************************************************************
   5. 초기화 (컴포넌트 마운트 시)
   * @hook useEffect
   * @description * 컴포넌트 마운트 시 브라우저의 푸시 지원 여부를 확인하고, 기존 구독 정보가 없다면 권한 상태에 따라 자동으로 구독을 시도합니다.
   */
  useEffect(() => {
    const initialize = async () => {
      if (!memberId) return;
      // 1. 푸시 알림 지원 여부 확인
      if (!isPushSupported()) {
        setState((prev) => ({
          ...prev,
          isSupported: false,
          error: "Push notifications are not supported.",
        }));
        return;
      }

      // 2. 지원하는 경우, 상태 업데이트 및 현재 알림 권한 설정
      setState((prev) => ({
        ...prev,
        isSupported: true,
        permission: Notification.permission,
      }));

      const registration = await navigator.serviceWorker.ready; // 서비스 워커가 활성화될 때까지 기다립니다.
      const existingSubscription =
        await registration.pushManager.getSubscription(); // 현재 활성화된 푸시 구독 객체를 가져옵니다.

      // 기존 구독이 존재하면 상태를 업데이트합니다.
      if (existingSubscription) {
        setState((prev) => ({
          ...prev,
          isSubscribed: true,
          subscription: existingSubscription,
        }));
      } else {
        const currentPermission = Notification.permission;
        setState((prev) => ({
          ...prev,
          isSupported: true,
          permission: currentPermission,
        }));
        if (currentPermission === "default") {
          const isGranted = await requestPermission(); // 내부 함수 호출
          if (isGranted) await subscribe(); // 권한 허용되면 바로 구독
        } else if (currentPermission === "granted") {
          await subscribe(); // 이미 권한이 있으면 바로 구독
        }
      }
    };

    initialize();
  }, [memberId, requestPermission, subscribe]);

  /************************************************************
   * 6. subscription 변경 시 - 구독 정보 서버 등록
   ************************************************************/
  /**
   * @hook useEffect
   * @description 푸시 구독 정보가 변경되거나 구독 상태가 활성화될 때 서버에 구독 정보를 전송합니다.
   *              `memberId`를 사용하여 현재 사용자의 구독 정보를 백엔드에 등록합니다.
   *
   * - `state.subscription` 객체가 존재하고 `state.isSubscribed`가 true일 때 실행됩니다.
   * - 구독 객체에서 `endpoint`, `p256dh` 키, `auth` 키를 추출하여 서버에 전송할 형식으로 변환합니다.
   * - `registerPushSubscription` API를 호출하여 서버에 구독 정보를 등록합니다.
   * - 오류 발생 시 콘솔에 에러를 로깅합니다.
   */
  useEffect(() => {
    if (state.subscription && state.isSubscribed) {
      const alreadyRegistered = localStorage.getItem("pushRegistered"); // 서버에 구독정보가 저장되어있는지
      if (alreadyRegistered) return; // 이미 등록했으면 종료
      const sendSubscriptionToServer = async () => {
        try {
          // p256dh 및 auth 키는 Uint8Array 형태이므로 Base64 문자열로 변환합니다.
          const subscriptionData = {
            endpoint: state.subscription!.endpoint,
            keys: {
              p256dh: btoa(
                String.fromCharCode(
                  ...new Uint8Array(state.subscription!.getKey("p256dh")!)
                )
              ),
              auth: btoa(
                String.fromCharCode(
                  ...new Uint8Array(state.subscription!.getKey("auth")!)
                )
              ),
            },
          };
          await registerPushSubscription(subscriptionData);
          localStorage.setItem("pushRegistered", "true"); // 등록 완료 표시
          console.log("푸시 구독 정보가 서버에 등록되었습니다.");
        } catch (error) {
          console.error("서버에 구독 정보 전송 실패:", error);
        }
      };

      sendSubscriptionToServer();
    }
  }, [state.subscription, state.isSubscribed]);

  /************************************************************
   * 7️. 구독 해제 함수
   * @function unsubscribe
   * @description 푸시 알림 서비스 구독을 해지하는 비동기 함수입니다.
   *              성공 시 구독 객체를 상태에서 제거합니다.
   * @returns {Promise<boolean>} 구독 해지 성공 여부
   */
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
      return true;
    } catch (error) {
      console.error("Unsubscription failed:", error);
      setState((prev) => ({ ...prev, error: "구독 해제에 실패했습니다." }));
      return false;
    }
  }, [state.subscription]); // `subscription` 객체가 변경될 때마다 이 함수를 재생성합니다.

  /************************************************************
   * 8️. 에러 초기화 함수
   * @function clearError
   * @description 현재 설정된 에러 메시지를 초기화하는 함수입니다.
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []); // 의존성 배열이 비어 있으므로 컴포넌트 렌더링 시마다 재생성되지 않습니다.

  /************************************************************
   * 9️. 훅 반환
   * @returns {PushNotificationState & PushNotificationActions}
   * @description 훅의 현재 상태와 액션 함수들을 반환합니다.
   */
  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe,
    clearError,
  };
};
