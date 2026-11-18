/** @jest-environment node */
import { sql } from "drizzle-orm";

import { createSupplierOrder } from "./orders";
import { updateInventory } from "./inventory";

import {
  NOW,
  SHIPPING,
  line,
  makeEnv,
  resetData,
  setStock,
  stockOf,
  type TestEnv,
} from "../../tests/acceptance/order-fulfilment/harness";

let t: TestEnv;

beforeEach(async () => {
  t = await makeEnv();
  await resetData(t.db);
});

async function seedOrder(id: string, lines: ReturnType<typeof line>[]) {
  await createSupplierOrder(t.env, { orderId: id, date: NOW, shipping: SHIPPING, lines });
}

describe("inventory update", () => {
  it("[SWHM2-C-0193] an inventory update reprocesses only PENDING orders", async () => {
    await seedOrder("P1", [line(1, "EST-1", 1)]);
    await seedOrder("C1", [line(1, "EST-1", 1)]);
    await t.db.run(sql`UPDATE supplier_order SET status = 'COMPLETED' WHERE order_id = 'C1'`);
    await setStock(t.db, "EST-1", 0);
    await updateInventory(t.env, [{ itemId: "EST-1", checked: true, value: "5" }]);
    expect(t.reprocessed).toEqual(["P1"]);
  });

  it("[SWHM2-C-0194] blank and negative quantities are not applied", async () => {
    await setStock(t.db, "EST-1", 5);
    await updateInventory(t.env, [{ itemId: "EST-1", checked: true, value: "" }]);
    expect(await stockOf(t.db, "EST-1")).toBe(5);
    await updateInventory(t.env, [{ itemId: "EST-1", checked: true, value: "-3" }]);
    expect(await stockOf(t.db, "EST-1")).toBe(5);
    await updateInventory(t.env, [{ itemId: "EST-1", checked: true, value: "8" }]);
    expect(await stockOf(t.db, "EST-1")).toBe(8);
  });
});
