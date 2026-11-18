import { expect, test } from "@playwright/test";

const USER = process.env.ADMIN_USER ?? "j2ee";
const PASSWORD = process.env.ADMIN_PASSWORD ?? "j2ee";

test("[SWHM2-C-0211] a clerk signs in, ticks one row and sees its new quantity", async ({
  page,
}) => {
  await page.goto("/admin/login");
  await page.getByLabel(/^user id$/i).fill(USER);
  await page.getByLabel(/^password$/i).fill(PASSWORD);
  await page.getByRole("button", { name: /sign in|log ?in|submit/i }).click();
  await page.goto("/admin/inventory");
  await expect(page.getByRole("heading", { name: "Inventory" })).toBeVisible();

  const qty = page.locator('input[name^="qty_"]').first();
  const itemId = (await qty.getAttribute("name"))!.slice("qty_".length);
  await qty.fill("42");
  await page.locator(`input[name="item_${itemId}"]`).check();
  await expect(page.getByText("1 item will change")).toBeVisible();
  await page.getByRole("button", { name: "Update inventory" }).last().click();

  await expect(page.getByText("Stock updated for 1 item")).toBeVisible();
  const row = page.locator("tr", { has: page.locator(`input[name="qty_${itemId}"]`) });
  await expect(row.locator("td").nth(1)).toContainText("42");
});
