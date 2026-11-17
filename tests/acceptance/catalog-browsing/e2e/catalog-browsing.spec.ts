import { expect, test } from "@playwright/test";

// case: SWHM2-C-0018@v1
test("SWHM2-C-0018 storefront browse screens and populate tool", async ({ page }) => {
  const res = await page.request.post("/api/catalog/populate");
  expect(res.ok()).toBe(true);

  await page.goto("/catalog");
  await expect(page.getByRole("link", { name: /fish/i }).first()).toBeVisible();
  await page.getByRole("link", { name: /fish/i }).first().click();

  await expect(page.getByRole("link", { name: /angelfish/i }).first()).toBeVisible();
  await page
    .getByRole("link", { name: /angelfish/i })
    .first()
    .click();

  await expect(page.getByText("EST-1").first()).toBeVisible();
  await page
    .getByText("EST-1")
    .first()
    .catch(() => undefined);

  await page.goto("/catalog/search?q=angel");
  await expect(page.getByText(/angelfish/i).first()).toBeVisible();
});
