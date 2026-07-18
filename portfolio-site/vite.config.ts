import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import legacy from "@vitejs/plugin-legacy";

export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ["Chrome >= 49", "Edge >= 15", "Safari >= 10"],
      modernPolyfills: false,
    }),
  ],
});
