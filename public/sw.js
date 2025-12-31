const CACHE_NAME = "daehoint-issue-v4"; // 버전 업데이트
const URLS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
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
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(URLS_TO_CACHE);
      })
      .then(() => {
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
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// 3. 네트워크 요청 가로채기 (개선된 버전)
self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  // 같은 오리진이 아닌 요청은 Service Worker를 거치지 않음
  if (requestUrl.origin !== location.origin) {
    return;
  }

  // 오디오/비디오 파일은 Service Worker를 거치지 않음 (스트리밍 최적화)
  if (isMediaFile(requestUrl.pathname)) {
    return;
  }

  // API 요청은 항상 네트워크만 사용 (캐시 사용 안 함)
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
        if (response && response.status === 200 && 
            (requestUrl.pathname.endsWith('.html') || 
             requestUrl.pathname.endsWith('.js') || 
             requestUrl.pathname.endsWith('.css') ||
             requestUrl.pathname === '/')) {
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

// 4. 푸시 알림 수신
self.addEventListener("push", (event) => {
  const pushData = event.data ? event.data.json() : {};

  const title = pushData.title || "새로운 알림";
  const options = {
    body: pushData.body || "새로운 메시지가 도착했습니다.",
    icon: pushData.icon,
    badge: pushData.badge,
    data: {
      url: pushData.url || "/",
    },
  };

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

  event.waitUntil(self.registration.showNotification(title, options));
});

// 5. 알림 클릭 처리
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

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

  const urlToOpen = event.notification.data.url || "/";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (new URL(client.url).pathname === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});