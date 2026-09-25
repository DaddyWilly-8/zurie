import { test as setup, expect } from "@playwright/test";

const ADMIN_EMAIL = "e2e-admin@test.local";
const ADMIN_PASSWORD = "e2e-test-password-123";
const ADMIN_STORAGE_STATE = "e2e/.auth/admin.json";

// Logs in once and saves the session for every admin-journey test to
// reuse via storageState, instead of each test logging in fresh. The
// backend's login rate limiter (5/min per email+IP — see
// AppServiceProvider's `login` RateLimiter) blocks a 6th login attempt
// within a minute for the same account, and a full admin-journey run
// used to log in once per test (5+ times) — found failing intermittently
// for exactly this reason, not a real bug in the app or the tests
// themselves. One login here, reused everywhere, fixes it for good and
// makes the suite faster.
setup("authenticate as admin", async ({ page }) => {
  await page.goto("/admin/login");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Email").fill(ADMIN_EMAIL);
  await page.getByLabel("Password").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/admin(\/)?$/, { timeout: 15_000 });

  await page.context().storageState({ path: ADMIN_STORAGE_STATE });
});
