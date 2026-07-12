import { defineConfig } from "@playwright/test";

import { productionConfig } from "./playwright.config";

export default defineConfig({
  ...productionConfig,
  webServer: {
    ...productionConfig.webServer,
    command: "pnpm dev",
  },
});
