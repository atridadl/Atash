import { defineConfig } from "@playwright/test";
import "dotenv/config";

const BASE_URL = process.env.E2E_TEST_BASE_URL || "http://localhost:3000";

export default defineConfig({
  testDir: "e2e",
  webServer: process.env.E2E_TEST_BASE_URL
    ? {
        command: "pnpm dev",
        url: "http://127.0.0.1:3000",
      }
    : undefined,
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
});
