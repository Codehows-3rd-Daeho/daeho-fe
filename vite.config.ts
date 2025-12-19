import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    https: {
      key: fs.readFileSync('./localhost-key.pem'),
      cert: fs.readFileSync('./localhost.pem')
    },
    host: "localhost",
    proxy: {
      "/api": {
        // 프론트에서 "/api"로 시작하는 요청이 들어오면
        target: "http://localhost:8080", // Spring Boot 서버로 전달
        // 경로 재작성 : 프론트에서 /api/...라고 요청하지만, 백엔드에서는 /api가 필요 없을 경우.
        rewrite: (path) => path.replace(/^\/api/, ""),
        changeOrigin: true,
      },
    },
  },
});
