import { expect, test, type Page } from "@playwright/test";

const USER = process.env.ADMIN_USER ?? "j2ee";
const PASSWORD = process.env.ADMIN_PASSWORD ?? "j2ee";

async function openInventory(page: Page): Promise<void> {
  await page.goto("/admin/login");
  await page.getByLabel(/^user id$/i).fill(USER);
  await page.getByLabel(/^password$/i).fill(PASSWORD);
  await page.getByRole("button", { name: /sign in|log ?in|submit/i }).click();
  await page.goto("/admin/inventory");
}

/** The first inventory row: its item id (from the qty_<id> input name) and the row locator. */
async function firstRow(page: Page) {
  const qty = page.locator('input[name^="qty_"]').first();
  await expect(qty).toBeVisible();
  const itemId = (await qty.getAttribute("name"))!.slice("qty_".length);
  const row = page.locator("tr", { has: qty });
  return { itemId, row, qty };
}

async function existing(row: ReturnType<Page["locator"]>): Promise<number> {
  const text = await row.locator("td").nth(1).innerText();
  return Number.parseInt(text.trim(), 10);
}

// case: SWHM2-C-0179@v1
test("SWHM2-C-0179 inventory screen rows show id, quantity, new-quantity input, checkbox and submit", async ({
  page,
}) => {
  await openInventory(page);
  const { itemId, row } = await firstRow(page);
  await expect(row).toContainText(itemId);
  expect(Number.isNaN(await existing(row))).toBe(false);
  await expect(row.locator(`input[name="qty_${itemId}"]`)).toBeVisible();
  await expect(row.locator(`input[type="checkbox"][name="item_${itemId}"]`)).toBeVisible();
  await expect(page.getByRole("button", { name: /submit|update/i })).toBeVisible();
});

// case: SWHM2-C-0195@v1
test("SWHM2-C-0195 an unticked item keeps its stock when the form is submitted", async ({
  page,
}) => {
  await openInventory(page);
  const { itemId, row, qty } = await firstRow(page);
  const before = await existing(row);
  await qty.fill(String(before + 15));
  await page.getByRole("button", { name: /submit|update/i }).click();
  await page.goto("/admin/inventory");
  const again = page.locator("tr", { has: page.locator(`input[name="qty_${itemId}"]`) });
  expect(await existing(again)).toBe(before);
});

// case: SWHM2-C-0211@v1
test("SWHM2-C-0211 a clerk update sets the quantity and reprocesses pending orders", async ({
  page,
  request,
}) => {
  await openInventory(page);
  const { itemId } = await firstRow(page);
  const set = async (value: number) => {
    const qty = page.locator(`input[name="qty_${itemId}"]`);
    await qty.fill(String(value));
    await page.locator(`input[name="item_${itemId}"]`).check();
    await page.getByRole("button", { name: /submit|update/i }).click();
    await page.goto("/admin/inventory");
  };
  await set(0);

  const orderId = `E2E-${Date.now()}`;
  const xml =
    `<SupplierOrder><OrderId>${orderId}</OrderId><OrderDate>2026-11-18</OrderDate>` +
    `<ShippingInfo><Name>Ann</Name><Address>1 Main St</Address><Email>a@x.com</Email><Phone>555</Phone></ShippingInfo>` +
    `<LineItem><CategoryId>C</CategoryId><ProductId>P</ProductId><ItemId>${itemId}</ItemId><LineNum>1</LineNum><Quantity>1</Quantity><UnitPrice>9.99</UnitPrice></LineItem></SupplierOrder>`;
  const posted = await request.post("/api/supplier/purchase-orders", {
    data: xml,
    headers: { "content-type": "application/xml" },
  });
  expect(posted.ok()).toBe(true);
  const waiting = await request.get(`/api/supplier/purchase-orders/${orderId}`);
  expect((await waiting.json()).status).toBe("PENDING");

  await set(5);
  const { row } = await firstRow(page);
  expect(await existing(row)).toBe(4);
  const done = await request.get(`/api/supplier/purchase-orders/${orderId}`);
  expect((await done.json()).status).toBe("COMPLETED");
});
