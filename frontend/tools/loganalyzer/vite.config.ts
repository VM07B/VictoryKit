import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3012,
    host: true,
  },
  define: {
    __API_BASE__: JSON.stringify(
      "https://loganalyzer.maula.ai/api/v1/loganalyzer"
    ),
    __WS_BASE__: JSON.stringify("wss://loganalyzer.maula.ai/ws"),
  },
});
