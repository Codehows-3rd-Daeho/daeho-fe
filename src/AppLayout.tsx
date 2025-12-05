// AppLayout.tsx
import Sidebar from "./common/Sidebar/Sidebar";
import Header from "./common/Header/Header";
import { sidebarItems } from "./common/Sidebar/SidebarItems";
import type { ReactNode } from "react";
import { useAuthStore } from "./store/useAuthStore";

type AppLayoutProps = {
  children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  const { member } = useAuthStore();
  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-[300px] shrink-0 border-r bg-white">
        <Sidebar items={sidebarItems} selectedId="dashboard" />
      </aside>

      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="h-[62px] border-b shrink-0 bg-white">
          <Header
            name={member?.name ?? ""}
            jobPosition={member?.jobPosition ?? ""}
            notifications={[]}
          />
        </header>

        <main className="flex-1 overflow-auto bg-gray-50 p-6 flex justify-center">
          <div className="w-full max-w-[1500px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
