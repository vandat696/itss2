import { defineConfig } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { join } from "node:path";

const baseURL = "http://127.0.0.1:3011";
const runId = process.env.CAREER_TEST_RUN ?? randomUUID();
process.env.CAREER_TEST_RUN = runId;
export default defineConfig({
  testDir: "./tests/e2e",
  workers: 1,
  timeout: 45_000,
  use: { baseURL, trace: "retain-on-failure", channel: process.env.PLAYWRIGHT_CHANNEL },
  webServer: {
    command: "npm run db:setup && npm run start -- --port 3011",
    url: baseURL,
    timeout: 90_000,
    env: { DATABASE_URL: `file:./e2e-${runId}.db`, CV_DIR: join(process.cwd(), "data", `e2e-${runId}`) },
  },
});
