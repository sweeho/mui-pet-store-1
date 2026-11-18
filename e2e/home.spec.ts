import { expect, test } from "@playwright/test";

/**
 * UI / E2E TEST
 *
 * Drives the real app in a real browser: the landing page inside the shell, the grouped
 * navigation, and the menu button on a small screen.
 */
test.describe("Landing page", () => {
  test("shows the welcome title and a tile for every primary area", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Welcome to Pet Store");
    const main = page.getByRole("main");
    for (const href of ["/catalog", "/cart", "/signon", "/admin/inventory", "/admin"]) {
      await expect(main.locator(`a[href="${href}"]`).first()).toBeVisible();
    }
    await expect(page.getByRole("contentinfo")).toContainText("© 2026 Pet Store");
  });

  test("a placeholder area shows the shared empty frame inside the shell", async ({ page }) => {
    await page.goto("/admin");

    await expect(page.getByTestId("empty-frame")).toContainText("not available yet");
    await expect(
      page.getByRole("navigation").first().getByRole("link", { name: "Home" }),
    ).toBeVisible();
  });

  test("opens the navigation from the menu button on a small screen", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    await expect(page.getByRole("link", { name: "Home" })).not.toBeVisible();
    await page.getByRole("button", { name: "Open the menu" }).click();
    await expect(page.getByRole("link", { name: "Home" })).toBeVisible();
  });
});
