import { expect, test, type Page } from "@playwright/test";

const USER = process.env.ADMIN_USER ?? "j2ee";
const PASSWORD = process.env.ADMIN_PASSWORD ?? "j2ee";

async function signIn(page: Page, password = PASSWORD): Promise<void> {
  await page.goto("/admin/login");
  await page.getByLabel(/^user id$/i).fill(USER);
  await page.getByLabel(/^password$/i).fill(password);
  await page.getByRole("button", { name: /sign in|log ?in|submit/i }).click();
}

// case: SWHM2-C-0232@v1
test("SWHM2-C-0232 refresh with uncommitted changes warns first", async ({ page }) => {
  await signIn(page);
  await page.goto("/admin/orders");
  const approve = page.getByRole("button", { name: /approve/i }).first();
  await approve.click();

  const messages: string[] = [];
  page.once("dialog", async (dialog) => {
    messages.push(dialog.message());
    await dialog.dismiss();
  });
  await page.getByRole("button", { name: /refresh/i }).click();
  expect(messages).toHaveLength(1);
  expect(messages[0]).toMatch(/commit|discard/i);
  // Cancelling keeps the uncommitted change.
  await expect(page.getByText(/approved/i).first()).toBeVisible();
});

// case: SWHM2-C-0234@v1
test("SWHM2-C-0234 admin login, home and failed sign-in pages", async ({ page }) => {
  await page.goto("/admin/login");
  await expect(page.getByLabel(/^user id$/i)).toBeVisible();
  await expect(page.getByLabel(/^password$/i)).toBeVisible();

  await signIn(page, "definitely-wrong-password");
  const back = page.getByRole("link", { name: /sign in|log ?in|try again/i });
  await expect(back).toBeVisible();
  await back.first().click();
  await expect(page).toHaveURL(/\/admin\/login/);

  await signIn(page);
  await expect(page.getByText(/launch rich client/i)).toBeVisible();
  await expect(page.getByText(/log ?out/i).first()).toBeVisible();
});

// case: SWHM2-C-0241@v1
test("SWHM2-C-0241 a visitor without the administrator role is sent to login", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByLabel(/^user id$/i)).toBeVisible();
  await page.goto("/admin/orders");
  await expect(page).toHaveURL(/\/admin\/login/);
});

// case: SWHM2-C-0242@v1
test("SWHM2-C-0242 logout ends the session", async ({ page }) => {
  await signIn(page);
  await expect(page.getByText(/launch rich client/i)).toBeVisible();
  await page
    .getByText(/log ?out/i)
    .first()
    .click();
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
});
