import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import type { JSX } from "@emotion/react/jsx-runtime";
import { lazy } from "react";
import AppLayout from "./AppLayout";

const Login = lazy(() => import("./login/page/Login"));
const Dashboard = lazy(() => import("./dashboard/page/Dashboard"));
const IssueList = lazy(() => import("./issue/page/IssueList"));
const IssueKanban = lazy(() => import("./issue/page/IssueKanban"));
const IssueCreate = lazy(() => import("./issue/page/IssueCreate"));
const IssueUpdate = lazy(() => import("./issue/page/IssueUpdate"));
const IssueDtl = lazy(() => import("./issue/page/IssueDtl"));
const MeetingList = lazy(() => import("./meeting/page/MeetingList"));
const MeetingDtl = lazy(() => import("./meeting/page/MeetingDtl"));
const MeetingCreate = lazy(() => import("./meeting/page/MeetingCreate"));
const MeetingUpdate = lazy(() => import("./meeting/page/MeetingUpdate"));
const MeetingScheduler = lazy(() => import("./meeting/page/MeetingScheduler"));
const MTIssueKanban = lazy(() => import("./mytask/page/MTIssueKanban"));
const MTIssueList = lazy(() => import("./mytask/page/MTIssueList"));
const MTMeetingList = lazy(() => import("./mytask/page/MTMeetingList"));
const MTMeetingScheduler = lazy(
  () => import("./mytask/page/MTMeetingScheduler")
);
const MyPage = lazy(() => import("./mypage/MyPage"));
const AdminSetting = lazy(() => import("./admin/setting/page/AdminSetting"));
const AdminLog = lazy(() => import("./admin/log/page/LogList"));
const MemberList = lazy(() => import("./admin/member/page/MemberList"));
const PWAInstallGuide = lazy(() => import("./common/PWAInstallGuide"));

type PrivateRouteProps = {
  children: JSX.Element;
  isAdmin?: boolean;
};

function PrivateRoute({ children, isAdmin = false }: PrivateRouteProps) {
  const { isAuthenticated, member } = useAuthStore();
  const role = member?.role;
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
              <Navigate to="/" replace />
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
                  {/* 대시보드 */}
                  <Route path="/" element={<Dashboard />} />

                  {/* 마이페이지 */}
                  <Route path="/mypage" element={<MyPage />} />

                  {/* 사이드바 */}
                  <Route path="/issue/list" element={<IssueList />} />
                  <Route path="/issue/kanban" element={<IssueKanban />} />
                  <Route path="/issue/create" element={<IssueCreate />} />
                  <Route
                    path="/issue/:issueId/update"
                    element={<IssueUpdate />}
                  />
                  <Route path="/issue/:issueId" element={<IssueDtl />} />

                  <Route path="/meeting/list" element={<MeetingList />} />
                  <Route
                    path="/meeting/schedule"
                    element={<MeetingScheduler />}
                  />
                  <Route path="/meeting/create" element={<MeetingCreate />} />
                  <Route path="/meeting/:meetingId" element={<MeetingDtl />} />
                  <Route
                    path="/meeting/:meetingId/update"
                    element={<MeetingUpdate />}
                  />

                  {/* 나의 업무 */}
                  <Route
                    path="/mytask/issue/kanban"
                    element={<MTIssueKanban />}
                  />
                  <Route path="/mytask/issue/list" element={<MTIssueList />} />
                  <Route path="/mytask/meeting" element={<MTMeetingList />} />
                  <Route
                    path="/mytask/schedule"
                    element={<MTMeetingScheduler />}
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
                  <Route
                    path="/admin/log"
                    element={
                      <PrivateRoute isAdmin>
                        <AdminLog />
                      </PrivateRoute>
                    }
                  />
                  <Route path="/pwa-guide" element={<PWAInstallGuide />} />
                </Routes>
              </AppLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
