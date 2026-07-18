import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // Keep the main module compatible with Chromium-based desktop WeChat clients.
    target: "es2017",
  },
});
