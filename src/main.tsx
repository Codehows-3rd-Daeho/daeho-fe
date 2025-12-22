import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// PWA: 서비스 워커 등록 Service Worker를 지원하는지 확인.
if ("serviceWorker" in navigator) {
  // 페이지 로드 완료 후 Service Worker를 등록.
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("Service Worker registered: ", registration);
        // 서비스 워커의 업데이트를 강제로 확인하여 항상 최신 버전을 사용하도록 보장합니다.
        registration.update();
      })
      .catch((error) => {
        console.log("Service Worker registration failed: ", error);
      });
  });
}

createRoot(document.getElementById("root")!).render(
  //DatePicker 사용
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <App />
  </LocalizationProvider>
);
