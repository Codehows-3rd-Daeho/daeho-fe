import { useState } from "react";
import { Monitor, Smartphone, Apple } from "lucide-react";

export default function PWAInstallGuide() {
  const [activeTab, setActiveTab] = useState<"pc" | "android" | "ios">("pc");
  const [activeBrowser, setActiveBrowser] = useState<"chrome" | "edge">(
    "chrome"
  );

  const img = (src: string, alt: string) => (
    <img
      src={src}
      alt={alt}
      className="w-full max-w-xs sm:max-w-md mx-auto rounded-lg border border-gray-300"
    />
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-8 pt-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            PWA 앱 설치 가이드
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            기기에 따라 아래 안내를 따라 설치해 주세요.
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab("pc")}
              className={`flex items-center gap-2 px-4 py-4 font-medium ${
                activeTab === "pc"
                  ? "text-[#1c468d] border-b-2 border-[#1c468d]"
                  : "text-gray-600"
              }`}
            >
              <Monitor className="w-5 h-5" />
              PC
            </button>

            <button
              onClick={() => setActiveTab("android")}
              className={`flex items-center gap-2 px-4 py-4 font-medium ${
                activeTab === "android"
                  ? "text-[#1c468d] border-b-2 border-[#1c468d]"
                  : "text-gray-600"
              }`}
            >
              <Smartphone className="w-5 h-5" />
              Android
            </button>

            <button
              onClick={() => setActiveTab("ios")}
              className={`flex items-center gap-2 px-4 py-4 font-medium ${
                activeTab === "ios"
                  ? "text-[#1c468d] border-b-2 border-[#1c468d]"
                  : "text-gray-600"
              }`}
            >
              <Apple className="w-5 h-5" />
              iOS
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* PC */}
        {activeTab === "pc" && (
          <>
            <div className="flex gap-3">
              <button
                onClick={() => setActiveBrowser("chrome")}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  activeBrowser === "chrome"
                    ? "bg-[#1c468d] text-white"
                    : "bg-white border border-gray-300"
                }`}
              >
                Chrome
              </button>
              <button
                onClick={() => setActiveBrowser("edge")}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  activeBrowser === "edge"
                    ? "bg-[#1c468d] text-white"
                    : "bg-white border border-gray-300"
                }`}
              >
                Edge
              </button>
            </div>

            {[
              {
                step: 1,
                title: "웹사이트 접속",
                desc: (
                  <>
                    <code className="bg-gray-100 px-2 py-1 rounded break-all">
                      https://www.daehoint-issue.com
                    </code>{" "}
                    으로 접속합니다.
                  </>
                ),
              },
              {
                step: 2,
                title: "설치 아이콘 클릭",
                desc: "주소 표시줄 오른쪽의 설치 아이콘을 클릭합니다.",
                img:
                  activeBrowser === "chrome"
                    ? "/pwa-guide/pc-chrome-install-icon.png"
                    : "/pwa-guide/pc-edge-install-icon.png",
              },
              {
                step: 3,
                title: "설치 완료",
                desc: "바탕화면에 앱 아이콘이 생성됩니다.",
                img: "/pwa-guide/pc-desktop-icon.png",
              },
              {
                step: 4,
                title: "알림 설정 (필수)",
                desc: (
                  <>
                    로그인 후 알림 팝업이 나오면 <strong>반드시 허용</strong>을
                    눌러주세요.
                  </>
                ),
                img: "/pwa-guide/pc-notification-popup.png",
              },
            ].map((s) => (
              <div
                key={s.step}
                className="bg-white rounded-lg p-6 border border-gray-200"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-8 h-8 bg-[#1c468d] text-white rounded-full flex items-center justify-center font-bold">
                    {s.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">{s.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{s.desc}</p>
                    {s.img && img(s.img, s.title)}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Android */}
        {activeTab === "android" && (
          <>
            <div className="bg-[#1c468d]/10 border border-[#1c468d]/30 rounded-lg p-4 text-sm text-[#1c468d]">
              <strong>지원 브라우저:</strong> Chrome, Samsung Internet, Edge,
              Firefox
            </div>

            {[
              {
                title: "웹사이트 접속",
                desc: (
                  <>
                    지원 브라우저에서{" "}
                    <code className="bg-gray-100 px-2 py-1 rounded break-all">
                      https://www.daehoint-issue.com
                    </code>{" "}
                    으로 접속합니다.
                  </>
                ),
              },
              {
                title: "설치 아이콘 클릭",
                desc: "주소 표시줄 오른쪽의 설치 아이콘을 클릭합니다.",
                img: "/pwa-guide/android-install-icon.png",
              },
              {
                title: "추가 버튼 클릭",
                desc: "팝업에서 추가 버튼을 클릭합니다.",
                img: "/pwa-guide/android-add-icon.png",
              },
              {
                title: "설치 완료",
                desc: "홈 화면에 앱 아이콘이 생성됩니다.",
                img: "/pwa-guide/android-home-icon.png",
              },
              {
                title: "알림 설정 (필수)",
                desc: "로그인 후 알림 팝업이 나오면 반드시 허용을 눌러주세요.",
                img: "/pwa-guide/android-notification-popup.png",
              },
              {
                title: "Android 앱 내부 알림 설정",
                desc: `  Android 앱 내 알림 설정에 따라 Issue Manage 아이콘 설치 후에도 알림이 수신되지 않을 수 있습니다. 
                        설정 > 애플리케이션 > Issue Manager > 알림 이용에서 알림 허용 여부를 확인해주세요. `,
                img: "/pwa-guide/android-app-setting.png",
              },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-white rounded-lg p-6 border border-gray-200"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-8 h-8 bg-[#1c468d] text-white rounded-full flex items-center justify-center font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">{s.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{s.desc}</p>
                    {s.img && img(s.img, s.title)}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* iOS */}
        {activeTab === "ios" && (
          <>
            <div className="bg-[#1c468d]/10 border border-[#1c468d]/30 rounded-lg p-4 text-sm text-[#1c468d]">
              <strong>주의:</strong> iOS는 반드시 Safari 브라우저를 사용해야
              합니다.
            </div>

            {[
              {
                title: "웹사이트 접속",
                desc: (
                  <>
                    Safari에서{" "}
                    <code className="bg-gray-100 px-2 py-1 rounded break-all">
                      https://www.daehoint-issue.com
                    </code>{" "}
                    으로 접속합니다.
                  </>
                ),
              },
              {
                title: "공유 버튼 클릭",
                desc: "상단 또는 하단의 공유 버튼을 클릭합니다.",
                img: "/pwa-guide/ios-share-button.png",
              },
              {
                title: "홈 화면에 추가",
                desc: "메뉴에서 ‘홈 화면에 추가’를 클릭합니다.",
                img: "/pwa-guide/ios-add-home.png",
              },
              {
                title: "추가 버튼 클릭",
                desc: "우측 상단의 추가 버튼을 클릭합니다.",
                img: "/pwa-guide/ios-add-icon.png",
              },
              {
                title: "설치 완료",
                desc: "홈 화면에 앱 아이콘이 생성됩니다.",
                img: "/pwa-guide/ios-home-icon.png",
              },
              {
                title: "알림 설정 (필수)",
                desc: "로그인 후 알림 팝업이 나오면 반드시 허용을 눌러주세요.",
                img: "/pwa-guide/ios-notification-popup.png",
              },
              {
                title: "iO 앱 내부 알림 설정",
                desc: `  iOS 앱 내 알림 설정에 따라 Issue Manage 아이콘 설치 후에도 알림이 수신되지 않을 수 있습니다. 
                        설정 > 앱 > Issue Manager > 알림에서 알림 허용 여부를 확인해주세요. `,
                img: "/pwa-guide/ios-app-setting.png",
              },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-white rounded-lg p-6 border border-gray-200"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-8 h-8 bg-[#1c468d] text-white rounded-full flex items-center justify-center font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">{s.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{s.desc}</p>
                    {s.img && img(s.img, s.title)}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </main>
    </div>
  );
}
