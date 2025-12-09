import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import type { JSX } from "@emotion/react/jsx-runtime";
import { lazy } from "react";
import MeetingCreate from "./meeting/page/MeetingCreate";
import AppLayout from "./AppLayout";
import MeetingScheduler from "./meeting/page/MeetingScheduler";
import IssueDtl from "./issue/page/IssueDtl";

const IssueList = lazy(() => import("./issue/page/IssueList"));
const IssueCreate = lazy(() => import("./issue/page/IssueCreate"));
const AdminSetting = lazy(() => import("./admin/setting/page/AdminSetting"));
const MemberList = lazy(() => import("./admin/member/page/MemberList"));
const MeetingList = lazy(() => import("./meeting/page/MeetingList"));
const Login = lazy(() => import("./login/page/Login"));
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
  const { isAuthenticated, member } = useAuthStore();
  const role = member?.role;

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
  const { isAuthenticated } = useAuthStore();
  return (
    <BrowserRouter>
      <Routes>
        {/* 로그인 페이지 — 사이드바/헤더 없음 */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/meeting/create" replace />
            ) : (
              <div className="flex justify-center items-center min-h-screen">
                <Login />
              </div>
            )
          }
        />

        {/* 인증된 페이지는 모두 AppLayout 사용 */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <AppLayout>
                <Routes>
                  <Route path="/issue/create" element={<IssueCreate />} />
                  <Route path="/issue/list" element={<IssueList />} />
                  <Route path="/meeting/create" element={<MeetingCreate />} />
                  <Route path="/issue/dtl" element={<IssueDtl />} />
                  <Route path="/meeting/list" element={<MeetingList />} />
                  <Route
                    path="/meeting/schedule"
                    element={<MeetingScheduler />}
                  />

                  {/* 관리자 */}
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
                </Routes>
              </AppLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
