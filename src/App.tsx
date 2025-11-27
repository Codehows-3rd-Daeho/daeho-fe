import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import Header from "./common/Header/Header";
import Sidebar from "./common/Sidebar/Sidebar";
import { sidebarItems } from "./common/Sidebar/SidebarItems";
import { Box } from "@mui/material";
import { useAuthStore } from "./store/useAuthStore";
import type { JSX } from "@emotion/react/jsx-runtime";
import { lazy } from "react";

const IssueList = lazy(() => import("./issue/page/IssueList"));
const IssueRegister = lazy(() => import("./issue/page/IssueRegister"));
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
      <Routes>
        <Route path="/login" element={<Login />}></Route>
        <Route
          path="*"
          element={
            <Box
              sx={{
                display: "flex",
                height: "100vh",
                flexDirection: "row",
              }}
            >
              {/* 사이드바 */}
              <Box
                sx={{
                  width: 300,
                  flexShrink: 0,
                }}
              >
                <Sidebar items={sidebarItems} selectedId="dashboard" />
              </Box>

              {/* 헤더 */}
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                <Header name="홍길동" jobPosition="팀장" notifications={[]} />
              </Box>

              {/* 페이지 콘텐츠 */}

              <Box
                sx={{
                  flex: 1,
                  width: "100%",
                  mt: "62px",
                  maxWidth: "1600px", // ★ 화면설계처럼 넓게 퍼지도록
                  margin: 0,
                  p: { xs: 2, md: 4 }, // ★ 반응형 padding
                }}
              >
                <Routes>
                  <Route
                    path="/issue/register"
                    element={
                      <PrivateRoute>
                        <IssueRegister />
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/issue/list"
                    element={
                      <PrivateRoute>
                        <IssueList />
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/meeting/list"
                    element={
                      <PrivateRoute>
                        <MeetingList />
                      </PrivateRoute>
                    }
                  />

                  {/* 관리자 */}
                  <Route
                    path="/admin/member"
                    element={
                      <PrivateRoute isAdmin>
                        <MemberList />
                      </PrivateRoute>
                    }
                  ></Route>
                  <Route
                    path="/admin/setting"
                    element={
                      <PrivateRoute isAdmin>
                        <AdminSetting />
                      </PrivateRoute>
                    }
                  ></Route>
                </Routes>
              </Box>
            </Box>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
