const CACHE_NAME = "daehoint-issue-v5"; // 버전 업데이트
const URLS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icon/apple-touch-icon.png",
  "/icon/android-chrome-192x192.png",
  "/icon/android-chrome-512x512.png",
];

// 오디오/비디오 확장자 목록
const MEDIA_EXTENSIONS = [
  "3gp", "3gpp", "ac3", "aac", "aiff", "amr", "au", "flac",
  "m4a", "mp3", "mxf", "opus", "ra", "wav", "weba",
  "asx", "avi", "ogm", "ogv", "m4v", "mov", "mp4", "mpeg", "mpg", "wmv"
];

// 확장자 체크 함수
const isMediaFile = (pathname) => {
  const ext = pathname.split('.').pop()?.toLowerCase();
  return ext ? MEDIA_EXTENSIONS.includes(ext) : false;
};

// 1. 서비스 워커 설치
self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching app shell");
        return cache.addAll(URLS_TO_CACHE);
      })
      .then(() => {
        console.log("[SW] Skip waiting");
        return self.skipWaiting();
      })
  );
});

// 2. 서비스 워커 활성화 및 이전 캐시 정리
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("[SW] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("[SW] Claiming clients");
        return self.clients.claim();
      })
  );
});

// 3. 네트워크 요청 가로채기
self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  // 같은 오리진이 아닌 요청은 Service Worker를 거치지 않음
  if (requestUrl.origin !== location.origin) {
    return;
  }

  // 오디오/비디오 파일은 Service Worker를 거치지 않음
  if (isMediaFile(requestUrl.pathname)) {
    return;
  }

  // API 요청은 항상 네트워크만 사용
  if (requestUrl.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(event.request, {
        cache: "no-cache",
      })
    );
    return;
  }

  // 정적 리소스만 "캐시 우선, 실패 시 네트워크" 전략 사용
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // 백그라운드에서 네트워크 요청하여 캐시 업데이트
        fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response);
            });
          }
        });
        return cachedResponse;
      }

      // 캐시에 없으면 네트워크 요청
      return fetch(event.request).then((response) => {
        // 정적 리소스만 캐시에 저장
        if (
          response &&
          response.status === 200 &&
          (requestUrl.pathname.endsWith(".html") ||
            requestUrl.pathname.endsWith(".js") ||
            requestUrl.pathname.endsWith(".css") ||
            requestUrl.pathname === "/")
        ) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      });
    })
  );
});

// 4. 푸시 알림 수신 (iOS 호환성 개선)
self.addEventListener("push", (event) => {
  console.log("[SW] Push event received");
  
  let pushData = {};
  
  // iOS는 때때로 다른 형식으로 데이터를 전송할 수 있음
  try {
    pushData = event.data ? event.data.json() : {};
    console.log("[SW] Push data parsed:", pushData);
  } catch (e) {
    console.error("[SW] Push data parsing error:", e);
    pushData = { title: "새로운 알림" };
  }

  const title = pushData.title || "새로운 알림";
  const options = {
<<<<<<< HEAD
    body: pushData.body || "새로운 메시지가 도착했습니다.",
    icon: pushData.icon || "/icon/android-chrome-192x192.png",
    badge: pushData.badge || "/icon/android-chrome-192x192.png",
    tag: "notification", // iOS에서 중복 알림 방지
    requireInteraction: false, // iOS는 true를 지원하지 않을 수 있음
=======
    body: pushData.body || "새로운 메시지가 도착했습니다.", // 알림 본문
    icon: pushData.icon || "/icon/android-chrome-192x192.png", // 알림 아이콘
    badge: pushData.badge || "/icon/android-chrome-192x192.png", // 알림 배지(작은 아이콘, 모바일 등에서 사용)
>>>>>>> 527908554e34107414fd89d7170c648626fce033
    data: {
      url: pushData.url || "/",
    },
  };

  // BroadcastChannel - iOS에서 지원 안 될 수 있으므로 try-catch
  try {
    const bc = new BroadcastChannel("notification-channel");
    bc.postMessage({
      type: "PUSH_RECEIVED",
      notification: {
        title,
        body: options.body,
        icon: options.icon,
        data: options.data,
      },
    });
    bc.close();
    console.log("[SW] BroadcastChannel message sent");
  } catch (e) {
    console.log("[SW] BroadcastChannel not supported or failed:", e);
    // iOS에서는 BroadcastChannel이 작동하지 않을 수 있지만,
    // 알림 자체는 정상적으로 표시되므로 문제없음
  }

  console.log("[SW] Showing notification:", title);
  event.waitUntil(self.registration.showNotification(title, options));
});

// 5. 알림 클릭 처리
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked");
  event.notification.close();

  // BroadcastChannel - iOS 호환성
  try {
    const bc = new BroadcastChannel("notification-channel");
    bc.postMessage({
      type: "NOTIFICATION_CLICKED",
      notification: {
        title: event.notification.title,
        body: event.notification.body,
        icon: event.notification.icon,
        data: event.notification.data,
      },
    });
    bc.close();
  } catch (e) {
    console.log("[SW] BroadcastChannel not supported:", e);
  }

  const urlToOpen = event.notification.data.url || "/";
  console.log("[SW] Opening URL:", urlToOpen);
  
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // 이미 열려있는 탭이 있으면 focus
        for (const client of clientList) {
          if (new URL(client.url).pathname === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        // 없으면 새 창 열기
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});