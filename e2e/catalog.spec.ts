import { expect, test } from "@playwright/test";

test.describe("Catalog", () => {
  test("[SWHM2-C-0018] browse from categories to an item, then search", async ({ page }) => {
    const res = await page.request.post("/api/catalog/populate");
    expect(res.ok()).toBe(true);

    await page.goto("/catalog");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Catalog");
    await page
      .getByRole("main")
      .getByRole("link", { name: /^fish$/i })
      .click();
    await expect(page).toHaveURL(/\/catalog\/categories\//);
    await page
      .getByRole("main")
      .getByRole("link", { name: /^angelfish$/i })
      .click();
    await expect(page).toHaveURL(/\/catalog\/products\//);
    await page
      .getByRole("main")
      .getByRole("link", { name: /^large angelfish$/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/catalog\/items\/EST-1/);
    await expect(page.getByText("Unit cost")).toBeVisible();

    await page.goto("/catalog/search?q=angel");
    await expect(
      page
        .getByRole("main")
        .getByText(/angelfish/i)
        .first(),
    ).toBeVisible();
    await page.goto("/catalog/search?q=%20%20");
    await expect(page.getByTestId("empty-frame")).toBeVisible();
  });
});
