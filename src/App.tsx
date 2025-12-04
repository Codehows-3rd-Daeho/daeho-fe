import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import Header from "./common/Header/Header";
import Sidebar from "./common/Sidebar/Sidebar";
import { sidebarItems } from "./common/Sidebar/SidebarItems";
import { useAuthStore } from "./store/useAuthStore";
import type { JSX } from "@emotion/react/jsx-runtime";
import { lazy } from "react";
import "./index.css";
import MeetingScheduler from "./meeting/page/MeetingScheduler";

const IssueList = lazy(() => import("./issue/page/IssueList"));
const IssueCreate = lazy(() => import("./issue/page/IssueCreate"));
const AdminSetting = lazy(() => import("./admin/page/setting/AdminSetting"));
const MemberList = lazy(() => import("./admin/page/member/MemberList"));
const MeetingList = lazy(() => import("./meeting/page/MeetingList"));
const Login = lazy(() => import("./admin/page/Login"));
/*===============================
  PrivateRoute 사용 안내
  ===============================
  1. 로그인만 필요하면:
    <PrivateRoute>컴포넌트</PrivateRoute>
  2. 관리자 전용 페이지면:
    <PrivateRoute isAdmin>컴포넌트</PrivateRoute>
  ===============================*/
type PrivateRouteProps = {
  children: JSX.Element;
  isAdmin?: boolean;
};

function PrivateRoute({ children, isAdmin = false }: PrivateRouteProps) {
  const { isAuthenticated, role } = useAuthStore();
  console.log(`isAuthentication : ${isAuthenticated}`);
  console.log(`role : ${role}`);

  // 로그인 안 했으면 로그인 페이지로
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // 관리자 전용 페이지인데, ADMIN이 아니면 홈으로 이동
  if (isAdmin && role !== "ADMIN") return <Navigate to="/" replace />;

  // 접근 가능하면 렌더링
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-50">
        {/* 사이드바 */}
        <aside className="w-[300px] flex-shrink-0 border-r bg-white">
          <Sidebar items={sidebarItems} selectedId="dashboard" />
        </aside>

        {/* 메인 영역 래퍼 (Header + Main Content) */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* 헤더 */}
          <header className="h-[62px] border-b flex-shrink-0 bg-white">
            <Header name="홍길동" jobPosition="팀장" notifications={[]} />
          </header>

          {/* 페이지 영역 */}
          <main className="flex-1 overflow-auto bg-gray-50">
            <div className="max-w-[1200px] w-full mx-auto px-6 **py-12**">
              <Routes>
                {/* <Route
                  path="/issue/register"
                  element={
                    <PrivateRoute>
                      <IssueRegister />
                    </PrivateRoute>
                  }
                /> */}
                <Route
                  path="/issue/list"
                  element={
                    <PrivateRoute>
                      <IssueList />
                    </PrivateRoute>
                  }
                />
                {/* <Route
                  path="/issue/kanban"
                  element={
                    <PrivateRoute>
                      <KanbanBoard />
                    </PrivateRoute>
                  }
                /> */}
                <Route
                  path="/meeting/list"
                  element={
                    <PrivateRoute>
                      <MeetingList />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/meeting/schedule"
                  element={
                    <PrivateRoute>
                      <MeetingScheduler />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/admin/member"
                  element={
                    <PrivateRoute isAdmin>
                      <MemberList />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/admin/setting"
                  element={
                    <PrivateRoute isAdmin>
                      <AdminSetting />
                    </PrivateRoute>
                  }
                />
                <Route path="/login" element={<Login />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
