import { expect, test, type Page } from "@playwright/test";

/** Hrefs of the global navigation's links, read from the root page. */
async function navHrefs(page: Page): Promise<string[]> {
  await page.goto("/");
  const hrefs = await page
    .getByRole("navigation")
    .first()
    .getByRole("link")
    .evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).getAttribute("href") ?? ""));
  return hrefs.filter((h) => h.startsWith("/"));
}

// case: SWHM2-C-0225@v1
test("SWHM2-C-0225 root URL shows landing page linking every primary area", async ({ page }) => {
  const navTargets = (await navHrefs(page)).filter((h) => h !== "/");
  expect(navTargets.length).toBeGreaterThan(0);

  await page.goto("/");
  const main = page.getByRole("main");
  await expect(main).toBeVisible();
  await expect(main.getByRole("heading").first()).toBeVisible();
  const mainHrefs = await main
    .getByRole("link")
    .evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).getAttribute("href") ?? ""));
  for (const target of navTargets) {
    expect(mainHrefs).toContain(target);
  }
});

// case: SWHM2-C-0226@v1
test("SWHM2-C-0226 navigation with landing link on every page", async ({ page }) => {
  const hrefs = await navHrefs(page);
  expect(hrefs).toContain("/");
  for (const href of hrefs) {
    await page.goto(href);
    const nav = page.getByRole("navigation").first();
    await expect(nav).toBeVisible();
    await expect(nav.locator('a[href="/"]').first()).toBeVisible();
  }
  const last = hrefs.find((h) => h !== "/") ?? "/";
  await page.goto(last);
  await page.getByRole("navigation").first().locator('a[href="/"]').first().click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("main")).toBeVisible();
});

// case: SWHM2-C-0227@v1
test("SWHM2-C-0227 page content renders inside shared shell", async ({ page }) => {
  const hrefs = await navHrefs(page);
  for (const href of hrefs) {
    await page.goto(href);
    const header = page.getByRole("banner");
    const nav = page.getByRole("navigation").first();
    const footer = page.getByRole("contentinfo");
    const main = page.getByRole("main");
    await expect(header).toBeVisible();
    await expect(nav).toBeVisible();
    await expect(footer).toBeVisible();
    await expect(main).toBeVisible();
    // The content sits between the header and the footer, not outside them.
    const [h, m, f] = await Promise.all([
      header.boundingBox(),
      main.boundingBox(),
      footer.boundingBox(),
    ]);
    expect(h && m && f).toBeTruthy();
    expect(m!.y).toBeGreaterThanOrEqual(h!.y + h!.height - 1);
    expect(f!.y).toBeGreaterThanOrEqual(m!.y + m!.height - 1);
  }
});
