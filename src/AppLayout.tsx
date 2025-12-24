import Sidebar from "./common/Sidebar/Sidebar";
import Header from "./common/Header/Header";
import { sidebarItems } from "./common/Sidebar/SidebarItems";
import { useState, type ReactNode } from "react";
import { useAuthStore } from "./store/useAuthStore";
import { usePushNotification } from "./webpush/usePushNotification";

type AppLayoutProps = {
  children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  const { member } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false); // 사이드바 접기 상태

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

        <main className="flex-1 overflow-auto  p-6 flex justify-center">
          <div className="w-full max-w-[1500px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
