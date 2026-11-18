import { expect, test } from "@playwright/test";

/** Sign in as the administrator, approve one pending order, Commit and read the summary. */
test("an administrator approves one order and sees the after-Commit summary", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel(/^user id$/i).fill("j2ee");
  await page.getByLabel(/^password$/i).fill("j2ee");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin\/orders$/);

  const row = page.locator('tr[data-order-id][data-status="PENDING"]').first();
  const id = (await row.getAttribute("data-order-id"))!;
  await row.getByRole("button", { name: "Approved" }).click();
  await expect(page.getByText("1 unsent change")).toBeVisible();
  await page.getByRole("button", { name: "Commit", exact: true }).click();

  await expect(page.getByText("1 change sent.")).toBeVisible();
  await expect(page.getByRole("status").or(page.getByRole("alert")).first()).toContainText(id);
  await expect(page.locator(`tr[data-order-id="${id}"]`)).toHaveAttribute(
    "data-status",
    "APPROVED",
  );
});

test("the orders screen needs an administrator session", async ({ page }) => {
  await page.goto("/admin/orders");
  await expect(page).toHaveURL(/\/admin\/login$/);
});
