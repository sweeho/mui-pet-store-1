import { expect, test } from "@playwright/test";

const addEst1 = async (page: import("@playwright/test").Page) => {
  await page.goto("/catalog/items/EST-1");
  await page.getByRole("button", { name: /add to cart/i }).click();
  await expect(page).toHaveURL(/\/cart$/);
};

test.describe("Shopping cart", () => {
  test("[SWHM2-C-0077] add an item, see it in the cart and proceed to checkout via sign-on", async ({
    page,
  }) => {
    await addEst1(page);
    await expect(page.getByText("EST-1").first()).toBeVisible();
    await expect(page.getByText("$16.50").first()).toBeVisible();
    await page
      .getByRole("main")
      .getByRole("link", { name: /proceed to checkout/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/signon\?returnTo=\/checkout/);
  });

  test("[SWHM2-C-0069] a quantity change is applied and a zero removes the line", async ({
    page,
  }) => {
    await addEst1(page);
    await page.getByLabel("Quantity of Angelfish, Large").fill("3");
    await page.getByRole("button", { name: "Update cart" }).click();
    await expect(page.getByLabel("Quantity of Angelfish, Large")).toHaveValue("3");
    await expect(page.getByText("$49.50").first()).toBeVisible();
    await page.getByLabel("Quantity of Angelfish, Large").fill("abc");
    await page.getByRole("button", { name: "Update cart" }).click();
    await expect(page.getByText("Your cart is empty")).toBeVisible();
  });

  test("[SWHM2-C-0073] emptying the cart after confirming shows the empty state", async ({
    page,
  }) => {
    await addEst1(page);
    await page.getByRole("button", { name: "Empty cart" }).click();
    await page
      .getByRole("dialog", { name: "Empty cart" })
      .getByRole("button", { name: "Empty cart" })
      .click();
    await expect(page.getByText("Your cart is empty")).toBeVisible();
  });
});
