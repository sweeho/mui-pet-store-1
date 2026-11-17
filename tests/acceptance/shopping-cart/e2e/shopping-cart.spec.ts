import { expect, test } from "@playwright/test";

// case: SWHM2-C-0077@v1
test("SWHM2-C-0077 add an item then proceed to checkout", async ({ page }) => {
  await page.goto("/catalog/items/EST-1");
  await page.getByRole("button", { name: /add to cart/i }).first().click();
  await page.goto("/cart");
  await expect(page.getByText("EST-1").first()).toBeVisible();
  await page.getByRole("main").getByRole("link", { name: /check ?out/i }).first().click();
  await expect(page).toHaveURL(/\/checkout/);
});
