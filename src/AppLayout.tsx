import Sidebar from "./common/Sidebar/Sidebar";
import Header from "./common/Header/Header";
import { sidebarItems } from "./common/Sidebar/SidebarItems";
import { useState, type ReactNode } from "react";
import { useAuthStore } from "./store/useAuthStore";
import { usePushNotification } from "./webpush/usePushNotification";
import Breadcrumb from "./common/PageHeader/Breadcrumb";
import { IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

type AppLayoutProps = {
  children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  const { member } = useAuthStore();
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
        <IconButton
          onClick={() => setMobileHidden((prev) => !prev)}
          style={{ position: "fixed", top: "10px", left: "10px", zIndex: 9999 }}
        >
          <MenuIcon />
        </IconButton>
      </div>

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
