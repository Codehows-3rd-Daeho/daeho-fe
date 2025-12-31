import Sidebar from "./common/Sidebar/Sidebar";
import Header from "./common/Header/Header";
import { sidebarItems } from "./common/Sidebar/SidebarItems";
import { useState, type ReactNode, useEffect, useRef } from "react";
import { useAuthStore } from "./store/useAuthStore";
import { usePushNotification } from "./webpush/usePushNotification";
import Breadcrumb from "./common/PageHeader/Breadcrumb";
import useRecordingStore from "./store/useRecordingStore";
import { IconButtonIcon } from "@mui/icons-material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";

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
    const handleBeforeUnload = (e: { preventDefault: () => void; returnValue: string; }) => {
      e.preventDefault();
      e.returnValue = message;
      handleLastChunk();
      clear();
      return message;
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
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
      const link = (e.target as HTMLElement).closest('a');
      if (link && isBlockingRef.current) {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('http') && href !== '#') {
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
    document.addEventListener('click', handleClick, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
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
        window.history.pushState(null, '', window.location.href);
        isNavigating = false;
      }else {
        handleLastChunk();
        clear();
      }
    };
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [shouldBlock, message]);
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { member } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false); // 사이드바 접기 상태
  const { isAnyRecordingActive, handleLastChunk, clear } = useRecordingStore();
  const isCurrentlyRecording = isAnyRecordingActive();
  const confirmationMessage = "페이지를 벗어나면 녹음이 중단됩니다. 계속하시겠습니까?";

  usePreventPageLeave(isCurrentlyRecording, confirmationMessage, handleLastChunk, clear);
  useBlockRouterNavigation(isCurrentlyRecording, confirmationMessage, handleLastChunk, clear);
  useBlockNavigation(isCurrentlyRecording, confirmationMessage, handleLastChunk, clear);
  //사이드바 간소화
  const [collapsed, setCollapsed] = useState(false);
  //모바일 사이드바 숨김
  const [mobileHidden, setMobileHidden] = useState(true);

  const handleToggleSidebar = () => setCollapsed((prev) => !prev);

  usePushNotification(member?.memberId ? String(member.memberId) : "");

  return (
    <div className="flex h-screen ">
      {/* 데스크탑 */}
      <div className="hidden md:block">
        <Sidebar
          items={sidebarItems}
          selectedId="dashboard"
          collapsed={collapsed}
          onToggle={handleToggleSidebar}
          width={300} // 접힐 때 72px 사용
        />
      </div>

      {/* 모바일 */}
      <div className="md:hidden">
        {mobileHidden || (
          <Sidebar
            items={sidebarItems}
            collapsed={false} // 모바일에서는 항상 펼친 상태
            onToggle={() => setMobileHidden(true)}
          />
        )}
        <IconButtonIcon
          onClick={() => setMobileHidden((prev) => !prev)}
          style={{ position: "fixed", top: "10px", left: "10px", zIndex: 9999 }}
        >
          <MenuIcon />
        </IconButtonIcon>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="h-[60px] shrink-0 ">
          <Header
            name={member?.name ?? ""}
            jobPosition={member?.jobPosition ?? ""}
            profileUrl={member?.profileUrl ?? ""}
            notifications={[]}
          />
        </header>

        <main className="flex-1 overflow-auto  p-6 flex-col">
          {/* 브레드크럼 */}
          <div className="w-full max-w-[1500px] mx-auto mb-4">
            <Breadcrumb />
          </div>
          <div className="w-full max-w-[1500px]  mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
