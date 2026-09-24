import { test, expect } from "@playwright/test";

// Customer journey: register -> browse -> add to cart -> apply a coupon
// -> checkout -> land back on the account page. Uses a fixture coupon
// (E2EFIXTURE, fixed TZS 100 off, effectively unlimited uses) and the
// persistent E2E fixture product (SKU E2E-FIXTURE-PRODUCT, topped up
// with 500 units of stock) so this test doesn't depend on catalog demo
// data's stock level at run time.
test("customer can register, add the fixture product to cart, apply a coupon, and checkout", async ({
  page,
}) => {
  const unique = Date.now();
  const email = `e2e-customer-${unique}@test.local`;
  const phone = `07${String(unique).slice(-8)}`;

  await page.goto("/register");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Full Name").fill("E2E Customer");
  await page.getByRole("textbox", { name: "Email", exact: true }).fill(email);
  await page.getByLabel("Phone Number").fill(phone);
  await page
    .getByRole("textbox", { name: "Password", exact: true })
    .fill("E2eTestPassword123");
  await page
    .getByRole("textbox", { name: "Confirm Password" })
    .fill("E2eTestPassword123");
  await page.getByRole("button", { name: /create account/i }).click();

  await expect(page).toHaveURL(/\/account/, { timeout: 15_000 });

  await page.goto("/shop");
  await page
    .getByText("E2E Fixture Product")
    .locator("..")
    .locator("..")
    .getByRole("button", { name: /add to bag/i })
    .click();

  await page.goto("/cart");
  await page.getByLabel("Coupon code").fill("E2EFIXTURE");
  await page.getByRole("button", { name: /^apply$/i }).click();
  await expect(page.getByText(/Discount \(E2EFIXTURE\)/)).toBeVisible({
    timeout: 10_000,
  });

  await page.getByLabel("Full Name").fill("E2E Customer");
  await page.getByLabel("Phone Number").fill(phone);
  await page.getByRole("button", { name: /place order/i }).click();

  await expect(page.getByText(/has been placed/i)).toBeVisible({
    timeout: 15_000,
  });
});
