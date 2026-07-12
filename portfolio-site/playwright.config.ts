import { defineConfig, type PlaywrightTestConfig } from "@playwright/test";

const baseURL = "http://127.0.0.1:3000";

export const productionConfig = {
  testDir: "./e2e",
  timeout: 120_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL,
    browserName: "chromium",
  },
  webServer: {
    command: "pnpm start",
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
} satisfies PlaywrightTestConfig;

export default defineConfig(productionConfig);
