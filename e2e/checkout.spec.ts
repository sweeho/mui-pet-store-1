import { expect, test } from "@playwright/test";

test("sign on, check out a cart of EST-1 and see the confirmation with the placeholder card", async ({
  page,
}) => {
  const user = `c${Date.now().toString(36)}`;
  await page.goto("/accounts/create");
  await page.getByLabel("User ID").fill(user);
  await page.getByLabel(/^password$/i).fill("pw12345");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/signon$/);
  await page.getByLabel(/^user name$/i).fill(user);
  await page.getByLabel(/^password$/i).fill("pw12345");
  await page.getByRole("button", { name: "Sign on" }).click();
  await expect(page.getByRole("button", { name: "Sign off" })).toBeVisible();

  await page.goto("/catalog/items/EST-1");
  await page.getByRole("button", { name: /add to cart/i }).click();
  await expect(page).toHaveURL(/\/cart$/);
  await page
    .getByRole("main")
    .getByRole("link", { name: /proceed to checkout/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/checkout$/);

  // Step 1: a missing required field is named; the page stays on shipping.
  const next = page.getByRole("button", { name: /continue to billing and payment/i });
  await expect(next).toBeVisible();
  await next.click();
  await expect(page.getByText("Street line 1 is required")).toBeVisible();

  await page.getByLabel("Given name").fill("Ana");
  await page.getByLabel("Street line 1").first().fill("1 Main St");
  await page.getByLabel("City").first().fill("Mountain View");
  await page.getByLabel("State").first().fill("CA");
  await page.getByLabel("Zip code").first().fill("94043");
  await page.getByLabel("Country").first().fill("USA");
  await next.click();

  // Step 2.
  await page.getByLabel("Same as shipping address").check();
  await page.getByLabel("Card number").fill("4111 1111 1111 1111");
  await page.getByLabel("Card type").fill("Visa");
  await page.getByLabel("Expiry date").fill("04/2028");
  await page.getByRole("button", { name: /place order/i }).click();

  await expect(page).toHaveURL(/\/checkout\/orders\/\d+$/);
  await expect(
    page.getByRole("heading", { name: "Thank you, your order is placed" }),
  ).toBeVisible();
  await expect(page.getByText("1234-2334")).toBeVisible();
  await expect(page.getByText("Duke Express")).toBeVisible();
  await expect(page.getByText("4111")).toHaveCount(0);

  // The cart was emptied by the order.
  await page.goto("/cart");
  await expect(page.getByText("Your cart is empty")).toBeVisible();
});
