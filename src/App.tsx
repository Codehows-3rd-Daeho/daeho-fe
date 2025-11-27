import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import MemberList from "./admin/pages/member/MemberList";
import "./App.css";
import Login from "./admin/pages/Login";
import { useAuthStore } from "./store/useAuthStore";
import AdminSetting from "./admin/pages/setting/AdminSetting";

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
        {/* 관리자 페이지 (로그인 + ADMIN 권한 필요) */}
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
        <Route path="/login" element={<Login />}></Route>
      </Routes>
    </BrowserRouter>
  );
}
