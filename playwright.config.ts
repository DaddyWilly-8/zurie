import { defineConfig, devices } from "@playwright/test";

// E2E covers real browser journeys against a running frontend + backend —
// unlike vitest.config.mts's pure-function unit tests. Requires the
// Laravel backend already running on :8000 (see docs/RUNBOOK.md);
// webServer below only starts the Next.js side.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: "list",
  use: {
    // Port 3000, not a separate one — the backend's SANCTUM_STATEFUL_DOMAINS
    // (bootstrap/app.php's statefulApi()) only trusts a fixed list of
    // origins for cookie-session auth, and localhost:3000 is the one
    // already on it (see CLAUDE.md §3). A different port's login
    // "succeeds" at the HTTP level but the session never actually
    // authenticates — found by running this against :3100 first.
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "admin-journey",
      testMatch: /admin-journey\.spec\.ts/,
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/admin.json",
      },
    },
    {
      name: "chromium",
      testIgnore: /admin-journey\.spec\.ts|auth\.setup\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run start -- -p 3000",
    // Not /api/health — that route ships in the separate ops/deploy PR
    // (area 1), not yet on this branch. "/" is a safe, always-present
    // readiness check for the dev server itself.
    url: "http://localhost:3000/",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
