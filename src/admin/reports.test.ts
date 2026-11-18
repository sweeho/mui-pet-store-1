/** @jest-environment node */
import { useIsolatedDatabase } from "@/db/isolated";

import { addItem, addOrder, clearOrders } from "./fixtures.test";
import { getChartInfo, salesReport } from "./reports";

let db: Awaited<ReturnType<typeof useIsolatedDatabase>>;
beforeAll(async () => {
  db = await useIsolatedDatabase();
});
beforeEach(async () => {
  await clearOrders(db);
  await addItem(db, { id: "FISH-1", category: "FISH", price: 10 });
  await addItem(db, { id: "FISH-2", category: "FISH", price: 5 });
  await addItem(db, { id: "DOGS-1", category: "DOGS", price: 100 });
  await addOrder(db, {
    id: 1,
    time: new Date(2020, 5, 1, 12),
    statuses: ["APPROVED"],
    lines: [
      { item: "FISH-1", quantity: 3 },
      { item: "DOGS-1", quantity: 2 },
    ],
  });
  await addOrder(db, {
    id: 2,
    time: new Date(2020, 6, 1, 12),
    statuses: ["APPROVED"],
    lines: [{ item: "FISH-2", quantity: 4 }],
  });
  await addOrder(db, {
    id: 3,
    time: new Date(2021, 0, 1, 12),
    statuses: ["APPROVED"],
    lines: [{ item: "DOGS-1", quantity: 9 }],
  });
});

const RANGE = { start: "01/01/2020", end: "12/31/2020" };
const byName = (r: unknown) =>
  Object.fromEntries(
    (r as { rows: { name: string; value: number }[] }).rows.map((x) => [x.name, x.value]),
  );

test("[SWHM2-C-0243] REVENUE by category with a grand total, by item for a category", async () => {
  const all = await salesReport(db, { ...RANGE, type: "REVENUE" });
  expect(byName(all)).toEqual({ FISH: 50, DOGS: 200 });
  expect((all as { total: number }).total).toBe(250);
  expect((all as { rows: { name: string }[] }).rows[0].name).toBe("DOGS");
  const fish = await salesReport(db, { ...RANGE, type: "REVENUE", category: "FISH" });
  expect(byName(fish)).toEqual({ "FISH-1": 30, "FISH-2": 20 });
  expect((fish as { total: number }).total).toBe(50);
});

test("[SWHM2-C-0240] a type other than REVENUE totals quantities", async () => {
  const r = await getChartInfo(db, { ...RANGE, type: "QUANTITY" });
  expect(byName(r)).toEqual({ FISH: 7, DOGS: 2 });
  expect((r as { total: number }).total).toBe(9);
});

test("[SWHM2-C-0233] a date that is not MM/dd/yyyy is rejected with the format message", async () => {
  for (const start of ["2020-01-31", "1/5/2020", "02/30/2020", ""]) {
    const r = await salesReport(db, { start, end: "12/31/2020", type: "REVENUE" });
    expect((r as { error: string }).error).toContain("MM/dd/yyyy");
  }
  const r = await salesReport(db, { start: "01/01/2020", end: "2020-12-31", type: "REVENUE" });
  expect((r as { error: string }).error).toContain("MM/dd/yyyy");
});

test("[SWHM2-C-0243] the end day is included", async () => {
  const r = await salesReport(db, { start: "06/01/2020", end: "06/01/2020", type: "ORDERS" });
  expect(byName(r)).toEqual({ FISH: 3, DOGS: 2 });
});
