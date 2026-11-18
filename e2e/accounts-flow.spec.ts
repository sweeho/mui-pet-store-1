import { expect, test } from "@playwright/test";

test("create account, sign on, see /account, sign off", async ({ page }) => {
  const user = `f${Date.now().toString(36)}`;
  await page.goto("/accounts/create");
  await page.getByLabel("User ID").fill(user);
  await page.getByLabel(/^password$/i).fill("pw12345");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/signon$/);

  await page.getByLabel(/^user name$/i).fill(user);
  await page.getByLabel(/^password$/i).fill("pw12345");
  await page.getByLabel(/remember my user name/i).check();
  await page.getByRole("button", { name: "Sign on" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("button", { name: "Sign off" })).toBeVisible();

  await page.goto("/account");
  await expect(page.getByText("active")).toBeVisible();

  await page.getByRole("button", { name: "Sign off" }).click();
  await page.goto("/account");
  await expect(page).toHaveURL(/\/signon\?returnTo=%2Faccount/);
  await expect(page.getByLabel(/^user name$/i)).toHaveValue(user);
});

test("a duplicate user ID lands on the creation error page", async ({ page }) => {
  const user = `d${Date.now().toString(36)}`;
  const create = () =>
    page.request.post("/api/accounts/users", {
      data: { userId: user, password: "pw" },
      maxRedirects: 0,
    });
  await create();
  await page.goto("/accounts/create");
  await page.getByLabel("User ID").fill(user);
  await page.getByLabel(/^password$/i).fill("pw");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/accounts\/create-error$/);
  await expect(page.getByRole("alert")).toContainText("Account not created");
});
