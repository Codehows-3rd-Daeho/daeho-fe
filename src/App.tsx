import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./common/Header/Header";
import Sidebar from "./common/Sidebar/Sidebar";
import { sidebarItems } from "./common/Sidebar/SidebarItems";
import { IssueList } from "./issue/page/IssueList";
import { Box } from "@mui/material";
import { MeetingList } from "./meeting/page/MeetingList";

function App() {
  return (
    <Router>
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
            {/* 이슈리스트 */}
            <Route path="/issue/list" element={<IssueList />} />

            {/* 회의 리스트 */}
            <Route path="/meeting/list" element={<MeetingList />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;
