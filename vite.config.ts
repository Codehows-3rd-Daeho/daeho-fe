import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  define: {
    global: 'window',
  },
  plugins: [react(), tailwindcss()],
  server: {
    host: "localhost",
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        rewrite: (path) => path.replace(/^\/api/, ""),
        changeOrigin: true,
      },
      '/ws': {
        target: 'http://localhost:8080',
        ws: true,  // WebSocket 프록시 활성화
        changeOrigin: true
      }
    },
    port: 5173,
  },
});
