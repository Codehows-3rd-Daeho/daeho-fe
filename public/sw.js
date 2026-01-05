const CACHE_NAME = "my-toy-app-cache-v2"; // 캐시 이름을 변경하여 새 버전임을 명시
const URLS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icon/apple-touch-icon-180x180.png",
  "/icon/android-chrome-192x192.png",
  "/icon/android-chrome-512x512.png",
];

/** install: 필요한 파일들을 캐시에 “미리 넣어두는 단계”
activate: 이전 버전 제거하고 “새 버전 준비하는 단계”
fetch: 브라우저 요청을 “서비스워커가 직접 처리하는 단계”
 */

// 1. 서비스 워커 설치
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME) // 1) 캐시 생성
      .then((cache) => {
        return cache.addAll(URLS_TO_CACHE); // 2) 필요한 파일들을 캐시에 저장
      })
      .then(() => {
        // 3) 설치 즉시 활성화 단계로 넘어갑니다.
        return self.skipWaiting();
      })
  );
});

// 2. 서비스 워커 활성화 및 이전 캐시 정리
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // 현재 캐시 이름과 다른 이전 버전의 캐시를 모두 삭제합니다.
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName); // 이전 캐시 삭제
            }
          })
        );
      })
      .then(() => {
        // 활성화 즉시 클라이언트 제어권을 가져옵니다.
        return self.clients.claim();
      })
  );
});

// 3. 네트워크 요청 가로채기 (네트워크 우선, 실패 시 캐시 사용)
self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  // 인증 관련 API 요청은 서비스 워커를 통과하지 않고 네트워크로 직접 보냅니다.
  if (requestUrl.pathname.startsWith("/api/login")) {
    // 네트워크로 직접 요청하고 응답 반환
    event.respondWith(fetch(event.request));
    return;
  }

  // 인증 외의 요청: "네트워크 우선, 실패 시 캐시 사용" 전략 적용 이유: 최신 데이터를 우선적으로 가져오되, 네트워크 오류 발생 시 캐시된 데이터로 폴백
  event.respondWith(
    fetch(event.request) // 1) 네트워크 요청 시도
      .catch(() => {
        // 2) 네트워크 실패 시 캐시를 사용
        // caches.match: 요청과 동일한 URL로 캐시된 응답이 있으면 반환
        return caches.match(event.request);
      })
  );
});

// 4. 푸시 알림 수신
self.addEventListener("push", (event) => {
  // event.data는 푸시 서버에서 보낸 페이로드 데이터
  // JSON 형식으로 파싱. 페이로드가 없으면 빈 객체 사용
  const pushData = event.data ? event.data.json() : {};

  const title = pushData.title || "새로운 알림"; // 서버가 제목을 보내지 않으면 기본값 사용
  const options = {
    body: pushData.body || "새로운 메시지가 도착했습니다.", // 알림 본문
    icon: pushData.icon || "/icon/android-chrome-192x192.png", // 알림 아이콘
    badge: pushData.badge || "/icon/android-chrome-192x192.png", // 알림 배지(작은 아이콘, 모바일 등에서 사용)
    data: {
      url: pushData.url || "/", // 알림 클릭 시 이동할 URL을 data에 저장
    },
  };

  // 브로드캐스트 채널을 통해 UI에 토스트 알림을 표시하도록 메시지 전송
  // 브라우저의 다른 스크립트(e.g. App.tsx)에서 토스트 UI를 표시하도록 메시지를 보냄
  const bc = new BroadcastChannel("notification-channel"); // 'notification-channel'이라는 이름의 채널 생성
  bc.postMessage({
    type: "PUSH_RECEIVED", // 메시지 타입 지정
    notification: {
      title, // 알림 제목
      body: options.body,
      icon: options.icon,
      data: options.data,
    },
  });
  bc.close(); // 메시지 전송 후 채널 닫기 (메모리 누수 방지)

  // 실제 OS/브라우저 푸시 알림 표시
  // event.waitUntil: 비동기 작업(알림 표시)을 서비스워커 수명 동안 보장
  event.waitUntil(self.registration.showNotification(title, options));
});

// 5. 알림 클릭 처리
self.addEventListener("notificationclick", (event) => {
  // 사용자가 알림을 클릭하면 알림 창을 닫음
  event.notification.close();

  // 브로드캐스트 채널을 통해 클릭 이벤트를 UI에 전달
  // React 앱 등 페이지 스크립트가 토스트나 알림 클릭 이벤트를 처리할 수 있도록 메시지 전송
  const bc = new BroadcastChannel("notification-channel"); // 'notification-channel' 채널 생성
  bc.postMessage({
    type: "NOTIFICATION_CLICKED", // 메시지 타입 지정
    notification: {
      title: event.notification.title,
      body: event.notification.body,
      icon: event.notification.icon,
      data: event.notification.data,
    },
  });
  bc.close();

  // 클릭 시 지정된 URL로 브라우저 창 포커스 이동
  const urlToOpen = event.notification.data.url || "/"; // URL이 없으면 루트 경로('/')로 fallback
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true }) // 현재 열린 모든 윈도우 클라이언트 검색
      .then((clientList) => {
        // 이미 해당 URL을 가진 창이 열려있으면 해당 창으로 포커스 이동
        for (const client of clientList) {
          if (new URL(client.url).pathname === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        // 열려 있는 창이 없으면 새 창/탭으로 열기
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
