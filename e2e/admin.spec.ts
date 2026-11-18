import { expect as baseExpect, test, type Page } from "@playwright/test";

// A first visit compiles each route in the dev server, which on a small runner takes far longer
// than the 5s default; one test stays well below its own limit.
const expect = baseExpect.configure({ timeout: 30_000 });
test.setTimeout(120_000);

async function signIn(page: Page, password = "j2ee"): Promise<void> {
  await page.goto("/admin/login");
  await page.getByLabel(/^user id$/i).fill("j2ee");
  await page.getByLabel(/^password$/i).fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("[SWHM2-C-0234] a wrong password shows the error page, which links back to sign-in", async ({
  page,
}) => {
  await signIn(page, "wrong");
  await expect(page.getByText("We couldn’t sign you in")).toBeVisible();
  await page.getByRole("link", { name: "Back to sign in" }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  await signIn(page);
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("link", { name: "Launch Rich Client" })).toBeVisible();
});

test("[SWHM2-C-0242] logging out ends the session", async ({ page }) => {
  await signIn(page);
  await expect(page.getByRole("button", { name: "Log out" })).toBeVisible();
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.goto("/admin/reports");
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test("[SWHM2-C-0233] an administrator reads a report and is told the date format", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/admin/reports?start=2000-01-01&end=12/31/2099&type=REVENUE");
  await expect(page.getByText(/enter the date as MM\/dd\/yyyy/i).first()).toBeVisible();
  await page.goto("/admin/reports?start=01/01/2000&end=12/31/2099&type=REVENUE");
  await expect(page.getByRole("heading", { name: /revenue by category/i })).toBeVisible();
});

test("[SWHM2-C-0232] Refresh warns before discarding a held change", async ({ page }) => {
  await signIn(page);
  await page.goto("/admin/orders?status=PENDING");
  const row = page.locator('tr[data-order-id][data-status="PENDING"]').first();
  await expect(async () => {
    await row.getByRole("button", { name: "Approved" }).click();
    await expect(page.getByText("1 unsent change")).toBeVisible({ timeout: 2000 });
  }).toPass({ timeout: 30000 });
  const messages: string[] = [];
  page.once("dialog", async (d) => {
    messages.push(d.message());
    await d.dismiss();
  });
  await page.getByRole("button", { name: "Refresh", exact: true }).click();
  await expect.poll(() => messages.length).toBe(1);
  await expect(page.getByText("1 unsent change")).toBeVisible();
});
