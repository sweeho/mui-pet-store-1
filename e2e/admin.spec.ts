import { expect, test } from "@playwright/test";

test("[SWHM2-C-0234][SWHM2-C-0242] an administrator signs in, reads a report and logs out", async ({
  page,
}) => {
  await page.goto("/admin/login");
  await page.getByLabel(/^user id$/i).fill("j2ee");
  await page.getByLabel(/^password$/i).fill("wrong");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("We couldn’t sign you in")).toBeVisible();
  await page.getByRole("link", { name: "Back to sign in" }).click();

  await page.getByLabel(/^user id$/i).fill("j2ee");
  await page.getByLabel(/^password$/i).fill("j2ee");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("link", { name: "Launch Rich Client" })).toBeVisible();

  await page.goto("/admin/reports?start=2000-01-01&end=12/31/2099&type=REVENUE");
  await expect(page.getByText(/enter the date as MM\/dd\/yyyy/i).first()).toBeVisible();
  await page.goto("/admin/reports?start=01/01/2000&end=12/31/2099&type=REVENUE");
  await expect(page.getByRole("heading", { name: /revenue by category/i })).toBeVisible();

  await page.goto("/admin");
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.goto("/admin/reports");
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test("[SWHM2-C-0232] Refresh warns before discarding a held change", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel(/^user id$/i).fill("j2ee");
  await page.getByLabel(/^password$/i).fill("j2ee");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.goto("/admin/orders?status=PENDING");
  const row = page.locator('tr[data-order-id][data-status="PENDING"]').first();
  await expect(async () => {
    await row.getByRole("button", { name: "Approved" }).click();
    await expect(page.getByText("1 unsent change")).toBeVisible({ timeout: 2000 });
  }).toPass({ timeout: 15000 });
  const messages: string[] = [];
  page.once("dialog", async (d) => {
    messages.push(d.message());
    await d.dismiss();
  });
  await page.getByRole("button", { name: "Refresh", exact: true }).click();
  await expect.poll(() => messages.length).toBe(1);
  await expect(page.getByText("1 unsent change")).toBeVisible();
});
