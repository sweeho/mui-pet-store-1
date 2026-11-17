import { expect, test, type Page } from "@playwright/test";

const USER = process.env.ADMIN_USER ?? "j2ee";
const PASSWORD = process.env.ADMIN_PASSWORD ?? "j2ee";

async function openOrders(page: Page): Promise<void> {
  await page.goto("/admin/login");
  await page.getByLabel(/^user id$/i).fill(USER);
  await page.getByLabel(/^password$/i).fill(PASSWORD);
  await page.getByRole("button", { name: /sign in|log ?in|submit/i }).click();
  await page.goto("/admin/orders");
}

async function sent(page: Page): Promise<{ orderId: string; status: string }[]> {
  const res = await page.request.get("/api/admin/approvals/sent");
  return (await res.json()).messages;
}

function pendingRows(page: Page) {
  return page.locator('tr[data-order-id][data-status="PENDING"]');
}

// case: SWHM2-C-0027@v1
test("SWHM2-C-0027 Commit sends only the changed orders", async ({ page }) => {
  await openOrders(page);
  const rows = pendingRows(page);
  expect(await rows.count()).toBeGreaterThanOrEqual(3);
  const ids = [0, 1, 2].map(async (i) => (await rows.nth(i).getAttribute("data-order-id"))!);
  const [a, b, c] = [await ids[0], await ids[1], await ids[2]];
  const before = (await sent(page)).length;
  await rows
    .nth(0)
    .getByRole("button", { name: /approve/i })
    .click();
  await rows
    .nth(1)
    .getByRole("button", { name: /approve/i })
    .click();
  await page
    .getByRole("button", { name: /commit/i })
    .first()
    .click();
  await expect.poll(async () => (await sent(page)).length).toBe(before + 2);
  const messages = (await sent(page)).slice(before);
  expect(messages.map((m) => m.orderId).sort()).toEqual([a, b].sort());
  expect(messages.every((m) => m.status === "APPROVED")).toBe(true);
  expect(messages.map((m) => m.orderId)).not.toContain(c);
});

// case: SWHM2-C-0028@v1
test("SWHM2-C-0028 a non-PENDING order status is not editable", async ({ page }) => {
  await openOrders(page);
  const row = page.locator('tr[data-order-id][data-status="APPROVED"]').first();
  await expect(row).toBeVisible();
  await expect(row.getByRole("button", { name: /approve|deny/i })).toHaveCount(0);
  await expect(row.getByRole("combobox")).toHaveCount(0);
});

// case: SWHM2-C-0029@v1
test("SWHM2-C-0029 choosing Denied sends nothing before Commit", async ({ page }) => {
  await openOrders(page);
  const row = pendingRows(page).first();
  const id = (await row.getAttribute("data-order-id"))!;
  const before = (await sent(page)).length;
  const select = row.getByRole("combobox");
  if ((await select.count()) > 0) {
    await select.selectOption({ label: "Denied" });
  } else {
    await row.getByRole("button", { name: /^denied?$/i }).click();
  }
  expect((await sent(page)).length).toBe(before);
  const stored = await page.request.get(`/api/admin/orders/${id}`);
  expect(stored.ok()).toBe(true);
  expect((await stored.json()).status).toBe("PENDING");
  await page.reload();
  await expect(page.locator(`tr[data-order-id="${id}"]`)).toHaveAttribute("data-status", "PENDING");
});
