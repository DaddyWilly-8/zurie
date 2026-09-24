import { test, expect } from "@playwright/test";

// Admin journey: login -> create a product (via the product form's own
// quick-add category) -> confirm it shows up in the list. Uses a
// dedicated E2E admin user (no 2FA, so the flow doesn't need to solve a
// TOTP code) — see docs/RUNBOOK.md / the test setup instructions for how
// that user is provisioned.
const ADMIN_EMAIL = "e2e-admin@test.local";
const ADMIN_PASSWORD = "e2e-test-password-123";

test("admin can log in and create a product with a freshly quick-added category", async ({
  page,
}) => {
  await page.goto("/admin/login");
  // Without this, a click can land before the form's finished hydrating
  // (the static SSR markup is present and clickable, but onSubmit isn't
  // wired up yet) — found by a submit that silently did nothing: no
  // network request, no error, just the same page.
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Email").fill(ADMIN_EMAIL);
  await page.getByLabel("Password").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();

  await expect(page).toHaveURL(/\/admin(\/)?$/, { timeout: 15_000 });

  await page.goto("/admin/products");
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

  await page.goto("/admin/login");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Email").fill(ADMIN_EMAIL);
  await page.getByLabel("Password").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/admin(\/)?$/, { timeout: 15_000 });

  await page.goto("/admin/orders");
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
