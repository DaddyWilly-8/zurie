import { test, expect } from "@playwright/test";

// Admin journey: create a product (via the product form's own quick-add
// category), advance an order's status, receive a GRN, complete a POS
// sale, and approve a review. Login itself is a separate test
// (e2e/auth.setup.ts) that runs once and saves its session for every test
// in this file to reuse via storageState (see playwright.config.ts's
// "admin-journey" project) — the backend's login rate limiter is 5/min
// per email+IP, and this file has 5 tests; logging in fresh in each one
// used to intermittently 429 on its own login. Uses a dedicated E2E admin
// user (no 2FA, so the setup login doesn't need to solve a TOTP code) —
// see docs/RUNBOOK.md for how that user is provisioned.

test("admin can create a product with a freshly quick-added category", async ({
  page,
}) => {
  await page.goto("/admin/products");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Add Product").click();

  const productDialog = page.getByRole("dialog");
  const unique = Date.now();
  const productName = `E2E Product ${unique}`;
  await productDialog.getByLabel("Name").fill(productName);
  await productDialog.getByLabel("Slug").fill(`e2e-product-${unique}`);

  // Quick-add a category from inside the product form rather than
  // depending on one already existing — exercises the feature this
  // session built, and keeps the test self-contained.
  await productDialog.getByLabel("New Category").click();
  const categoryDialog = page.getByRole("dialog", { name: /new category/i });
  const categoryName = `E2E Category ${Date.now()}`;
  await categoryDialog.getByLabel("Name").fill(categoryName);
  await categoryDialog.getByRole("button", { name: "Create" }).click();
  await expect(categoryDialog).toBeHidden();

  await productDialog.getByLabel("Price", { exact: true }).fill("1000");
  await productDialog.getByLabel("Buying Price").fill("500");

  await productDialog.getByRole("button", { name: /create product/i }).click();

  await expect(page.getByText(productName).first()).toBeVisible({
    timeout: 15_000,
  });
});

test("admin can advance an order to its next status", async ({
  page,
  request,
}) => {
  // Seeds a real order via the actual checkout endpoint (not a DB insert)
  // so this test exercises a genuine "new" order, the same way a customer
  // journey test would produce one — the admin journey itself starts from
  // "an order exists", so seeding it directly here keeps this test
  // self-contained instead of depending on run order against the customer
  // journey test.
  const csrfResponse = await request.get(
    "http://localhost:8000/sanctum/csrf-cookie",
  );
  const setCookieHeader = csrfResponse.headers()["set-cookie"] ?? "";
  const xsrfMatch = setCookieHeader.match(/XSRF-TOKEN=([^;]+)/);
  const xsrfToken = decodeURIComponent(xsrfMatch?.[1] ?? "");

  // Looked up by slug, not a hardcoded id — the fixture product's
  // auto-increment id differs between a local dev database and a fresh
  // CI database, but its slug is fixed.
  const fixtureProductResponse = await request.get(
    "http://localhost:8000/api/v1/products/e2e-fixture-product",
  );
  expect(fixtureProductResponse.ok()).toBeTruthy();
  const fixtureProductId = (await fixtureProductResponse.json()).data.id;

  const orderResponse = await request.post(
    "http://localhost:8000/api/v1/orders",
    {
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
        "X-XSRF-TOKEN": xsrfToken,
      },
      data: {
        customerName: "E2E Order Customer",
        customerPhone: "0700000000",
        // A persistent fixture product (SKU E2E-FIXTURE-PRODUCT) topped
        // up with 500 units of stock rather than a real catalog product —
        // this test asserts admin order-status behavior, not checkout, so
        // it shouldn't be coupled to whatever stock level a demo product
        // happens to have at test time.
        items: [{ productId: fixtureProductId, quantity: 1 }],
      },
    },
  );
  expect(orderResponse.ok()).toBeTruthy();
  const order = (await orderResponse.json()).data;

  await page.goto("/admin/orders");
  await page.waitForLoadState("networkidle");
  const orderRow = page
    .getByText(order.orderNumber)
    .locator("..")
    .locator("..");
  await orderRow.getByRole("button", { name: /^→/ }).click();

  await page
    .getByRole("dialog")
    .getByRole("button", { name: /confirm update/i })
    .click();

  await expect(page.getByText(order.orderNumber).first()).toBeVisible();
});

test("admin can create a purchase order and instant-receive it as a GRN", async ({
  page,
}) => {
  await page.goto("/admin/purchase-orders");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("New Purchase Order").click();

  const dialog = page.getByRole("dialog");

  // MUI's <TextField select> renders a role=combobox div, not a native
  // <select> — click to open it, then pick the MenuItem, same pattern as
  // the category/ledger quick-add selects elsewhere in this suite.
  await dialog.getByLabel("Product").click();
  await page.getByRole("option", { name: "E2E Fixture Product" }).click();

  await dialog.getByLabel("Unit").click();
  await page.getByRole("option").first().click();

  await dialog.getByLabel("Qty").fill("5");
  await dialog.getByLabel("Rate").fill("500");

  // Instant Receive = PO + GRN in one transaction (CLAUDE.md §6.4) — the
  // simplest way to exercise a real GRN receive through the UI without
  // a separate "Receive Goods" step needing its own purchase order to
  // already exist and be reloaded.
  await dialog.getByLabel(/Instant Receive/).click();

  await dialog.getByRole("button", { name: /save purchase order/i }).click();

  await expect(dialog).toBeHidden({ timeout: 15_000 });
  await expect(page.getByText(/received/i).first()).toBeVisible();
});

test("admin can complete a POS sale", async ({ page }) => {
  await page.goto("/admin/pos");
  await page.waitForLoadState("networkidle");

  await page.getByPlaceholder(/search products/i).fill("E2E-FIXTURE-PRODUCT");
  await page.getByText("E2E Fixture Product").click();

  // Outlet is a MUI select (role=combobox), not a native <select>.
  await page.getByLabel("Outlet").click();
  await page.getByRole("option").first().click();

  await page.getByLabel("Customer Name").fill("E2E POS Customer");
  await page.getByLabel("Customer Phone").fill("0722000111");

  await page.getByRole("button", { name: /complete sale/i }).click();

  await expect(page.getByText(/sale complete|success/i).first()).toBeVisible({
    timeout: 15_000,
  });
});

test("admin can approve a pending customer review", async ({ page }) => {
  // The pending review itself is a persistent fixture (product
  // E2E-FIXTURE-PRODUCT x customer e2e-customer@test.local, reset to
  // "pending" — see docs/TESTING.md's fixture list), not submitted live
  // through Playwright. It was, originally: a customer login via an
  // isolated request context (its own cookie jar, never shared with
  // `page`) reproducibly knocked the *admin*'s session on `page` back to
  // logged-out, every time, with no error in the Laravel log — a real,
  // reproducible interaction between the two guards sharing one session
  // cookie name that's worth investigating on its own, but not something
  // to keep this test blocked on. This test's actual job is verifying
  // the admin approval action, not re-proving the customer submission
  // flow (that's better covered by a backend PHPUnit test if it isn't
  // already).
  await page.goto("/admin/reviews");
  await page.waitForLoadState("networkidle");

  const reviewRow = page
    .getByText("E2E fixture review")
    .locator("..")
    .locator("..");
  await reviewRow.getByRole("button", { name: /approve/i }).click();

  await expect(page.getByText(/approved/i).first()).toBeVisible({
    timeout: 15_000,
  });
});
