// AppLayout.tsx
import Sidebar from "./common/Sidebar/Sidebar";
import Header from "./common/Header/Header";
import { sidebarItems } from "./common/Sidebar/SidebarItems";
import type { ReactNode } from "react";

type AppLayoutProps = {
  children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-[300px] flex-shrink-0 border-r bg-white">
        <Sidebar items={sidebarItems} selectedId="dashboard" />
      </aside>

      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="h-[62px] border-b flex-shrink-0 bg-white">
          <Header name="홍길동" jobPosition="팀장" notifications={[]} />
        </header>

        <main className="flex-1 overflow-auto bg-gray-50 p-6">{children}</main>
      </div>
    </div>
  );
}
