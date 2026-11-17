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
  const before = await page.locator("body").innerText();
  await approve.click();
  await expect.poll(async () => page.locator("body").innerText()).not.toBe(before);
  const afterChange = await page.locator("body").innerText();

  const messages: string[] = [];
  page.once("dialog", async (dialog) => {
    messages.push(dialog.message());
    await dialog.dismiss();
  });
  await page
    .getByRole("button", { name: /^\s*refresh\s*$/i })
    .first()
    .click();
  await expect.poll(() => messages.length).toBe(1);
  expect(messages[0]).toMatch(/commit|discard/i);
  // Cancelling keeps the uncommitted change: the page is exactly as it was after the change.
  expect(await page.locator("body").innerText()).toBe(afterChange);
});

// case: SWHM2-C-0234@v1
test("SWHM2-C-0234 admin login, home and failed sign-in pages", async ({ page }) => {
  await page.goto("/admin/login");
  await expect(page.getByLabel(/^user id$/i)).toBeVisible();
  await expect(page.getByLabel(/^password$/i)).toBeVisible();

  await signIn(page, "definitely-wrong-password");
  const back = page.getByRole("link", { name: /sign in|log ?in|try again/i }).first();
  await expect(back).toBeVisible();
  await back.click();
  await expect(page).toHaveURL(/\/admin\/login/);

  await signIn(page);
  await expect(page.getByText(/launch rich client/i).first()).toBeVisible();
  await expect(page.getByText(/log ?out/i).first()).toBeVisible();
});

// case: SWHM2-C-0241@v1
test("SWHM2-C-0241 a signed-in user without the administrator role is refused at admin endpoints", async ({
  page,
}) => {
  const userId = `u${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
  const created = await page.request.post("/api/accounts/users", {
    data: { userId, password: "pw12345" },
    maxRedirects: 0,
  });
  expect(created.status()).toBeLessThan(400);
  await page.goto("/signon");
  await page.getByLabel(/^user name$/i).fill(userId);
  await page.getByLabel(/^password$/i).fill("pw12345");
  await page.getByRole("button", { name: /sign on/i }).click();
  await page.goto("/account");
  await expect(page).toHaveURL(/\/account$/);

  // The signed-in non-admin is sent to the admin login on admin pages.
  await page.goto("/admin/orders");
  await expect(page).toHaveURL(/\/admin\/login/);

  // ...and the admin API refuses the request without processing it.
  const res = await page.request.post("/api/admin/appl", {
    data: "<Request><Type>GETORDERS</Type><Status>PENDING</Status></Request>",
    headers: { "content-type": "application/xml" },
    maxRedirects: 0,
  });
  const body = await res.text();
  expect(body).not.toMatch(/<Order[ >]/);
  expect(body).not.toMatch(/<Count>/);
  expect(res.status() >= 400 || /session|timeout|denied|log ?in/i.test(body)).toBe(true);
});

// case: SWHM2-C-0242@v1
test("SWHM2-C-0242 logout ends the session", async ({ page }) => {
  await signIn(page);
  await expect(page.getByText(/launch rich client/i).first()).toBeVisible();
  await page
    .getByText(/log ?out/i)
    .first()
    .click();
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
});
