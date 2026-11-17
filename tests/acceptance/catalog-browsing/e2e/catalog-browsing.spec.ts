import { expect, test } from "@playwright/test";

// case: SWHM2-C-0018@v1
test("SWHM2-C-0018 storefront browse screens and populate tool", async ({ page }) => {
  const res = await page.request.post("/api/catalog/populate");
  expect(res.ok()).toBe(true);

  await page.goto("/catalog");
  const fishLink = page.getByRole("main").getByRole("link", { name: /^fish$/i });
  await expect(fishLink).toBeVisible();
  await fishLink.click();

  const angelfishLink = page.getByRole("main").getByRole("link", { name: /^angelfish$/i });
  await expect(angelfishLink).toBeVisible();
  await angelfishLink.click();

  await expect(page.getByText("EST-1").first()).toBeVisible();

  await page.goto("/catalog/search?q=angel");
  await expect(page.getByText(/angelfish/i).first()).toBeVisible();
});
