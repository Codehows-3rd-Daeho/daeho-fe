import Sidebar from "./common/Sidebar/Sidebar";
import Header from "./common/Header/Header";
import { sidebarItems } from "./common/Sidebar/SidebarItems";
import { useState, type ReactNode, useEffect, useRef } from "react";
import { useAuthStore } from "./store/useAuthStore";
import { usePushNotification } from "./webpush/usePushNotification";
import Breadcrumb from "./common/PageHeader/Breadcrumb";
import useRecordingStore from "./store/useRecordingStore";
import { useLocation } from "react-router-dom";

type AppLayoutProps = {
  children: ReactNode;
};

function usePreventPageLeave(
  shouldPrevent: boolean,
  message: string,
  handleLastChunk: () => void,
  clear: () => void
) {
  useEffect(() => {
    if (!shouldPrevent) return;
    const handleBeforeUnload = (e: {
      preventDefault: () => void;
      returnValue: string;
    }) => {
      e.preventDefault();
      e.returnValue = message;
      handleLastChunk();
      clear();
      return message;
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [message, shouldPrevent]);
}

function useBlockRouterNavigation(
  shouldBlock: boolean,
  message: string,
  handleLastChunk: () => void,
  clear: () => void
) {
  const isBlockingRef = useRef(false);
  useEffect(() => {
    if (!shouldBlock) {
      isBlockingRef.current = false;
      return;
    }
    isBlockingRef.current = true;
    const handleClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest("a");
      if (link && isBlockingRef.current) {
        const href = link.getAttribute("href");
        if (href && !href.startsWith("http") && href !== "#") {
          e.preventDefault();
          e.stopPropagation();
          if (window.confirm(message)) {
            handleLastChunk();
            clear();
            isBlockingRef.current = false;
            link.click();
          }
        }
      }
    };
    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
      isBlockingRef.current = false;
    };
  }, [shouldBlock, message]);
}

function useBlockNavigation(
  shouldBlock: boolean,
  message: string,
  handleLastChunk: () => void,
  clear: () => void
) {
  useEffect(() => {
    if (!shouldBlock) return;
    let isNavigating = false;
    const handlePopState = () => {
      if (isNavigating) return;
      const userConfirmed = window.confirm(message);
      if (!userConfirmed) {
        isNavigating = true;
        window.history.pushState(null, "", window.location.href);
        isNavigating = false;
      } else {
        handleLastChunk();
        clear();
      }
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [shouldBlock, message]);
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { member } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAnyRecordingActive, handleLastChunk, clear } = useRecordingStore();
  const isCurrentlyRecording = isAnyRecordingActive();
  const confirmationMessage =
    "페이지를 벗어나면 녹음이 중단됩니다. 계속하시겠습니까?";

  usePreventPageLeave(
    isCurrentlyRecording,
    confirmationMessage,
    handleLastChunk,
    clear
  );
  useBlockRouterNavigation(
    isCurrentlyRecording,
    confirmationMessage,
    handleLastChunk,
    clear
  );
  useBlockNavigation(
    isCurrentlyRecording,
    confirmationMessage,
    handleLastChunk,
    clear
  );

  usePushNotification(member?.memberId ? String(member.memberId) : "");
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* 1. 사이드바 배치 변경: 
          Sidebar 내부에서 이미 Permanent/Temporary를 구분하므로 div로 감싸지 않습니다. */}
      <Sidebar
        items={sidebarItems}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        openMobile={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        width={300}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* 2. 헤더에 onMenuClick 전달 */}
        <header className="h-[60px] shrink-0">
          <Header
            name={member?.name ?? ""}
            jobPosition={member?.jobPosition ?? ""}
            profileUrl={member?.profileUrl ?? ""}
            notifications={[]}
            collapsed={collapsed}
            onMenuClick={() => setMobileOpen(true)}
          />
        </header>

        <main className="flex-1 overflow-auto  p-6 flex-col">
          {/* 브레드크럼 */}
          {location.pathname !== "/pwa-guide" && (
            <div className="w-full max-w-[1500px] mx-auto mb-4">
              <Breadcrumb />
            </div>
          )}
          <div className="w-full max-w-[1500px]  mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
