import { expect, test, type Page } from "@playwright/test";

const PROTECTED = "/account";

async function createUser(page: Page, userId: string, password: string) {
  const res = await page.request.post("/api/accounts/users", {
    data: { userId, password },
    maxRedirects: 0,
  });
  expect(res.status()).toBeLessThan(400);
}

async function submitSignOn(page: Page, userId: string, password: string) {
  await page.getByLabel(/user name/i).fill(userId);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign on/i }).click();
}

function uniqueUser() {
  return `u${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
}

// case: SWHM2-C-0134@v1
test("SWHM2-C-0134 an anonymous protected page request goes to sign-on", async ({ page }) => {
  await page.goto(PROTECTED);
  await expect(page).toHaveURL(/\/signon/);
  expect(decodeURIComponent(page.url())).toContain(PROTECTED);
  await expect(page.getByRole("button", { name: /sign on/i })).toBeVisible();
});

// case: SWHM2-C-0135@v1
test("SWHM2-C-0135 a signed-on user is served the protected page", async ({ page }) => {
  const user = uniqueUser();
  await createUser(page, user, "pw12345");
  await page.goto("/signon");
  await submitSignOn(page, user, "pw12345");
  await page.goto(PROTECTED);
  await expect(page).toHaveURL(new RegExp(`${PROTECTED}$`));
  await expect(page.getByText(user).first()).toBeVisible();
});

// case: SWHM2-C-0136@v1
test("SWHM2-C-0136 successful sign-on returns to the requested page", async ({ page }) => {
  const user = uniqueUser();
  await createUser(page, user, "pw12345");
  await page.goto(PROTECTED);
  await expect(page).toHaveURL(/\/signon/);
  await submitSignOn(page, user, "pw12345");
  await expect(page).toHaveURL(new RegExp(`${PROTECTED}$`));
  await expect(page.getByText(user).first()).toBeVisible();
});

// case: SWHM2-C-0137@v1
test("SWHM2-C-0137 a failed sign-on goes to the error page", async ({ page }) => {
  const user = uniqueUser();
  await createUser(page, user, "pw12345");
  await page.goto("/signon");
  await submitSignOn(page, user, "wrong-password");
  await expect(page).toHaveURL(/\/signon\/error/);
});

// case: SWHM2-C-0140@v1
test("SWHM2-C-0140 an existing user name redirects to the creation error page", async ({
  page,
}) => {
  const user = uniqueUser();
  await createUser(page, user, "pw12345");
  const res = await page.request.post("/api/accounts/users", {
    data: { userId: user, password: "pw12345" },
    maxRedirects: 0,
  });
  expect(res.status()).toBeGreaterThanOrEqual(300);
  expect(res.status()).toBeLessThan(400);
  expect(res.headers()["location"]).toMatch(/\/accounts\/create-error$/);
});
