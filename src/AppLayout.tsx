import Sidebar from "./common/Sidebar/Sidebar";
import Header from "./common/Header/Header";
import { sidebarItems } from "./common/Sidebar/SidebarItems";
import { useState, type ReactNode, useEffect, useRef } from "react";
import { useAuthStore } from "./store/useAuthStore";
import { usePushNotification } from "./webpush/usePushNotification";
import Breadcrumb from "./common/PageHeader/Breadcrumb";
import useRecordingStore from "./store/useRecordingStore";

type AppLayoutProps = {
  children: ReactNode;
};

function usePreventPageLeave(shouldPrevent: boolean, message: string, handleLastChunk: () => void) {
  useEffect(() => {
    if (!shouldPrevent) return;

    const handleBeforeUnload = (e: { preventDefault: () => void; returnValue: string; }) => {
      e.preventDefault();
      e.returnValue = message;
      handleLastChunk();
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [message, shouldPrevent]);
}

function useBlockRouterNavigation(shouldBlock: boolean, message: string, handleLastChunk: () => void) {
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

function useBlockNavigation(shouldBlock: boolean, message: string, handleLastChunk: () => void) {
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

  const { isRecording, handleLastChunk } = useRecordingStore();
  const isCurrentlyRecording = isRecording();
  const confirmationMessage = "페이지를 벗어나면 녹음이 중단됩니다. 계속하시겠습니까?";

  usePreventPageLeave(isCurrentlyRecording, confirmationMessage, handleLastChunk);
  useBlockRouterNavigation(isCurrentlyRecording, confirmationMessage, handleLastChunk);
  useBlockNavigation(isCurrentlyRecording, confirmationMessage, handleLastChunk);

  const handleToggleSidebar = () => setCollapsed((prev) => !prev);

  usePushNotification(member?.memberId ? String(member.memberId) : "");

  return (
    <div className="flex h-screen">
      <Sidebar
        items={sidebarItems}
        selectedId="dashboard"
        collapsed={collapsed}
        onToggle={handleToggleSidebar}
        width={300} // 접힐 때 72px 사용
      />

      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="h-[62px] border-b shrink-0 ">
          <Header
            name={member?.name ?? ""}
            jobPosition={member?.jobPosition ?? ""}
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
