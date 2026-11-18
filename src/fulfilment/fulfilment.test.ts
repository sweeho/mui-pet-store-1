/** @jest-environment node */
import { useIsolatedDatabase } from "@/db/isolated";
import { sql } from "drizzle-orm";

import { createSupplierOrder, approveOrder, getSupplierOrder } from "./orders";
import {
  fulfilLine,
  processApproval,
  processInvoice,
  processOrder,
  receiveSupplierOrder,
} from "./fulfilment";

import {
  NOW,
  SHIPPING,
  line,
  makeEnv,
  resetData,
  setStock,
  stockOf,
  supplierOrderXml,
  type TestEnv,
} from "../../tests/acceptance/order-fulfilment/harness";

let t: TestEnv;

beforeAll(async () => {
  await useIsolatedDatabase();
});

beforeEach(async () => {
  t = await makeEnv();
  await resetData(t.db);
});

async function seedOrder(id: string, lines: ReturnType<typeof line>[]) {
  await createSupplierOrder(t.env, { orderId: id, date: NOW, shipping: SHIPPING, lines });
}

describe("fulfilment", () => {
  it("[SWHM2-C-0182] an invoice covering all lines completes the order and notifies", async () => {
    await seedOrder("S1", [line(1, "EST-1", 1), line(2, "EST-2", 1)]);
    await approveOrder(t.env, "S1");
    await processInvoice(t.env, {
      orderId: "S1",
      lines: [
        { lineNum: 1, shipped: 1 },
        { lineNum: 2, shipped: 1 },
      ],
    });
    expect((await getSupplierOrder(t.env, "S1")).status).toBe("COMPLETED");
    expect(t.completed).toEqual(["S1"]);
  });

  it("[SWHM2-C-0185] an order with an unavailable line is not COMPLETED", async () => {
    await seedOrder("S1", [line(1, "EST-1", 1), line(2, "EST-2", 1)]);
    await setStock(t.db, "EST-1", 5);
    await processOrder(t.env, "S1");
    expect((await getSupplierOrder(t.env, "S1")).status).not.toBe("COMPLETED");
  });

  it("[SWHM2-C-0187] insufficient stock leaves the line unfulfilled and stock at 4", async () => {
    await seedOrder("S1", [line(1, "EST-1", 10)]);
    await setStock(t.db, "EST-1", 4);
    expect((await fulfilLine(t.env, "S1", 1)).shipped).toBe(false);
    expect(await stockOf(t.db, "EST-1")).toBe(4);
  });

  it("[SWHM2-C-0190] a line for an item without an inventory record is not fulfilled", async () => {
    await seedOrder("S1", [line(1, "NO-STOCK", 1)]);
    expect((await fulfilLine(t.env, "S1", 1)).shipped).toBe(false);
  });

  it("[SWHM2-C-0191] a fully shipped line is skipped and stock is not reduced again", async () => {
    await seedOrder("S1", [line(1, "EST-1", 2)]);
    await setStock(t.db, "EST-1", 10);
    await t.db.run(
      sql`UPDATE supplier_order_line SET quantity_shipped = 2 WHERE order_id = 'S1' AND line_num = 1`,
    );
    await processOrder(t.env, "S1");
    expect(await stockOf(t.db, "EST-1")).toBe(10);
  });

  it("[SWHM2-C-0192] invoice generation failure returns no invoice and keeps the order pending", async () => {
    await seedOrder("S1", [line(1, "EST-1", 1)]);
    await setStock(t.db, "EST-1", 5);
    t.invoiceGeneration.fail = true;
    const result = await processOrder(t.env, "S1");
    expect(result.invoice).toBeNull();
    expect((await getSupplierOrder(t.env, "S1")).status).toBe("PENDING");
    expect(t.completed).toEqual([]);
  });

  it("[SWHM2-C-0215] one invoice lists only the two lines shipped in this run", async () => {
    await seedOrder("S1", [line(1, "EST-1", 1), line(2, "EST-2", 1), line(3, "EST-3", 1)]);
    await setStock(t.db, "EST-1", 5);
    await setStock(t.db, "EST-2", 5);
    const { invoice } = await processOrder(t.env, "S1");
    expect(invoice).not.toBeNull();
    expect(invoice!.match(/<Invoice[\s>]/g)).toHaveLength(1);
    expect(invoice!.match(/<LineItem[\s>]/g)).toHaveLength(2);
    expect(invoice).toContain("EST-1");
    expect(invoice).toContain("EST-2");
    expect(invoice).not.toContain("EST-3");
  });

  it("[SWHM2-C-0216] sufficient stock is reduced from 10 to 7 and the line ships", async () => {
    await seedOrder("S1", [line(1, "EST-1", 3)]);
    await setStock(t.db, "EST-1", 10);
    expect((await fulfilLine(t.env, "S1", 1)).shipped).toBe(true);
    expect(await stockOf(t.db, "EST-1")).toBe(7);
  });

  it("[SWHM2-C-0219] an invoice adds the shipped quantity to give 5", async () => {
    await seedOrder("S1", [line(1, "EST-1", 5)]);
    await t.db.run(
      sql`UPDATE supplier_order_line SET quantity_shipped = 2 WHERE order_id = 'S1' AND line_num = 1`,
    );
    await processInvoice(t.env, { orderId: "S1", lines: [{ lineNum: 1, shipped: 3 }] });
    const rows = await t.db.all<{ quantity_shipped: number }>(
      sql`SELECT quantity_shipped FROM supplier_order_line WHERE order_id = 'S1' AND line_num = 1`,
    );
    expect(rows[0].quantity_shipped).toBe(5);
  });

  it("[SWHM2-C-0209] a supplier PO is sent only for the approved order", async () => {
    await processApproval(t.env, [
      { orderId: "OK1", approved: true },
      { orderId: "NO1", approved: false },
    ]);
    expect(t.supplierQueue).toHaveLength(1);
    expect(t.supplierQueue[0]).toContain("OK1");
    expect(t.supplierQueue[0]).not.toContain("NO1");
  });

  it("[SWHM2-C-0210] a received supplier PO is persisted and each line fulfilment is attempted", async () => {
    await setStock(t.db, "EST-1", 5);
    await setStock(t.db, "EST-2", 5);
    await receiveSupplierOrder(
      t.env,
      supplierOrderXml("R1", [
        ["EST-1", 2],
        ["EST-2", 3],
      ]),
    );
    expect((await getSupplierOrder(t.env, "R1")).lines).toHaveLength(2);
    expect(await stockOf(t.db, "EST-1")).toBe(3);
    expect(await stockOf(t.db, "EST-2")).toBe(2);
  });
});
