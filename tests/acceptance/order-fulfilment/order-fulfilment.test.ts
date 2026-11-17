/** @jest-environment node */
import { sql } from "drizzle-orm";

import {
  ORDER_STATUSES,
  approveOrder,
  createPurchaseOrder,
  createSupplierOrder,
  findOrdersByStatus,
  getLineItems,
  getPurchaseOrder,
  getSupplierOrder,
  isOrderStatus,
  listOrderStatus,
  parseSupplierOrderMessage,
  purgeSupplierOrders,
} from "@/fulfilment/orders";
import {
  buildInvoiceXml,
  buildSupplierOrderXml,
  parseDocument,
  toLineItem,
} from "@/fulfilment/documents";
import {
  fulfilLine,
  processApproval,
  processInvoice,
  processOrder,
  receiveSupplierOrder,
} from "@/fulfilment/fulfilment";
import { updateInventory } from "@/fulfilment/inventory";
import { nextId } from "@/fulfilment/uidgen";
import {
  NOW,
  SHIPPING,
  indexedColumns,
  line,
  makeEnv,
  rejects,
  resetData,
  setStock,
  stockOf,
  supplierOrderXml,
  type TestEnv,
} from "./harness";

let t: TestEnv;

beforeEach(async () => {
  t = await makeEnv();
  await resetData(t.db);
});

async function seedOrder(id: string, lines: ReturnType<typeof line>[]) {
  await createSupplierOrder(t.env, { orderId: id, date: NOW, shipping: SHIPPING, lines });
}

async function insertPo(id: number) {
  await t.db.run(
    sql`INSERT INTO purchase_order (order_id, user_name, order_time, locale, total_price, status)
        VALUES (${id}, 'j2ee', ${NOW.getTime()}, 'en_US', 10, 'PENDING')`,
  );
}

describe("order-fulfilment: data model", () => {
  // case: SWHM2-C-0175@v1
  it("[SWHM2-C-0175] order status is mandatory, one per order, at most 20 chars", async () => {
    const ins = (id: string, s: string | null) =>
      t.db.run(sql`INSERT INTO order_status (order_id, status) VALUES (${id}, ${s})`);
    await ins("X", "PENDING");
    expect(await rejects(ins("X", "APPROVED"))).toBe(true);
    expect(await rejects(ins("Y", null))).toBe(true);
    expect(await rejects(ins("Z", "A".repeat(21)))).toBe(true);
    const rows = await t.db.all<{ order_id: string }>(sql`SELECT order_id FROM order_status`);
    expect(rows).toHaveLength(1);
  });

  // case: SWHM2-C-0176@v1
  it("[SWHM2-C-0176] purchase order has an index on the user column", async () => {
    expect(await indexedColumns(t.db, "purchase_order")).toContain("user_name");
  });

  // case: SWHM2-C-0177@v1
  it("[SWHM2-C-0177] purchase order has an index on the date column", async () => {
    expect(await indexedColumns(t.db, "purchase_order")).toContain("order_time");
  });

  // case: SWHM2-C-0178@v1
  it("[SWHM2-C-0178] order manager has an index on the status column", async () => {
    expect(await indexedColumns(t.db, "order_manager")).toContain("status");
  });

  // case: SWHM2-C-0180@v1
  it("[SWHM2-C-0180] supplier order needs id, date, status and an existing contact", async () => {
    await t.db.run(sql`INSERT INTO contact_info (contact_id, email) VALUES (1, 'a@x.com')`);
    await t.db.run(
      sql`INSERT INTO supplier_order (order_id, order_date, status, contact_id)
          VALUES ('S1', ${NOW.getTime()}, 'PENDING', 1)`,
    );
    const stored = await t.db.all<{ order_id: string }>(sql`SELECT order_id FROM supplier_order`);
    expect(stored.map((r) => r.order_id)).toEqual(["S1"]);
    expect(
      await rejects(
        t.db.run(
          sql`INSERT INTO supplier_order (order_id, order_date, status, contact_id)
              VALUES ('S2', ${NOW.getTime()}, 'PENDING', 999)`,
        ),
      ),
    ).toBe(true);
    expect(
      await rejects(
        t.db.run(
          sql`INSERT INTO supplier_order (order_id, order_date, status, contact_id)
              VALUES ('S1', ${NOW.getTime()}, 'PENDING', 1)`,
        ),
      ),
    ).toBe(true);
  });

  // case: SWHM2-C-0183@v1
  it("[SWHM2-C-0183] a counter name has exactly one row with an integer value", async () => {
    await t.db.run(sql`INSERT INTO counter (name, value) VALUES ('order', 5)`);
    expect(
      await rejects(t.db.run(sql`INSERT INTO counter (name, value) VALUES ('order', 6)`)),
    ).toBe(true);
    const rows = await t.db.all<{ value: number }>(
      sql`SELECT value FROM counter WHERE name = 'order'`,
    );
    expect(rows).toEqual([{ value: 5 }]);
  });

  // case: SWHM2-C-0184@v1
  it("[SWHM2-C-0184] inventory quantity is required and one per item", async () => {
    await t.db.run(sql`INSERT INTO inventory (item_id, quantity) VALUES ('I', 3)`);
    expect(
      await rejects(t.db.run(sql`INSERT INTO inventory (item_id, quantity) VALUES ('I', 4)`)),
    ).toBe(true);
    expect(
      await rejects(t.db.run(sql`INSERT INTO inventory (item_id, quantity) VALUES ('J', NULL)`)),
    ).toBe(true);
    expect(await stockOf(t.db, "I")).toBe(3);
  });

  // case: SWHM2-C-0186@v1
  it("[SWHM2-C-0186] two stored lines have distinct line numbers and all fields", async () => {
    await insertPo(1);
    for (const l of [line(1, "EST-1", 2, 5.5), line(2, "EST-2", 3, 7.25)]) {
      await t.db.run(
        sql`INSERT INTO order_line (order_id, line_num, category_id, product_id, item_id, quantity, unit_price)
            VALUES (1, ${l.lineNum}, ${l.categoryId}, ${l.productId}, ${l.itemId}, ${l.quantity}, ${l.unitPrice})`,
      );
    }
    const rows = await t.db.all<Record<string, unknown>>(
      sql`SELECT line_num, category_id, product_id, item_id, quantity, unit_price
          FROM order_line WHERE order_id = 1 ORDER BY line_num`,
    );
    expect(rows).toEqual([
      {
        line_num: 1,
        category_id: "FISH",
        product_id: "FI-SW",
        item_id: "EST-1",
        quantity: 2,
        unit_price: 5.5,
      },
      {
        line_num: 2,
        category_id: "FISH",
        product_id: "FI-SW",
        item_id: "EST-2",
        quantity: 3,
        unit_price: 7.25,
      },
    ]);
    expect(
      await rejects(
        t.db.run(
          sql`INSERT INTO order_line (order_id, line_num, category_id, product_id, item_id, quantity, unit_price)
              VALUES (1, 1, 'FISH', 'FI-SW', 'EST-3', 1, 1)`,
        ),
      ),
    ).toBe(true);
  });

  // case: SWHM2-C-0188@v1
  it("[SWHM2-C-0188] a line with quantity 0 is rejected", async () => {
    await insertPo(1);
    expect(
      await rejects(
        t.db.run(
          sql`INSERT INTO order_line (order_id, line_num, category_id, product_id, item_id, quantity, unit_price)
              VALUES (1, 1, 'FISH', 'FI-SW', 'EST-1', 0, 1)`,
        ),
      ),
    ).toBe(true);
  });

  // case: SWHM2-C-0189@v1
  it("[SWHM2-C-0189] a stock update leaving negative stock is rejected", async () => {
    await setStock(t.db, "I", 2);
    expect(
      await rejects(
        t.db.run(sql`UPDATE inventory SET quantity = quantity - 3 WHERE item_id = 'I'`),
      ),
    ).toBe(true);
    expect(await stockOf(t.db, "I")).toBe(2);
  });

  // case: SWHM2-C-0217@v1
  it("[SWHM2-C-0217] supplier line items are keyed by order id and line number", async () => {
    await seedOrder("S1", [line(1, "EST-1", 2, 5.5), line(2, "EST-2", 3, 7.25)]);
    const second = await t.db.all<Record<string, unknown>>(
      sql`SELECT category_id, product_id, item_id, quantity, unit_price FROM supplier_order_line
          WHERE order_id = 'S1' AND line_num = 2`,
    );
    expect(second).toEqual([
      { category_id: "FISH", product_id: "FI-SW", item_id: "EST-2", quantity: 3, unit_price: 7.25 },
    ]);
    expect(
      await rejects(
        t.db.run(
          sql`INSERT INTO supplier_order_line (order_id, line_num, category_id, product_id, item_id, quantity, unit_price)
              VALUES ('S1', 2, 'FISH', 'FI-SW', 'EST-9', 1, 1)`,
        ),
      ),
    ).toBe(true);
  });

  // case: SWHM2-C-0224@v1
  it("[SWHM2-C-0224] line quantity is stored as an integer and unit price as a decimal", async () => {
    await insertPo(1);
    await t.db.run(
      sql`INSERT INTO order_line (order_id, line_num, category_id, product_id, item_id, quantity, unit_price)
          VALUES (1, 1, 'FISH', 'FI-SW', 'EST-1', 3, 9.99)`,
    );
    const rows = await t.db.all<{ q: string; p: string; pv: number; qv: number }>(
      sql`SELECT typeof(quantity) AS q, typeof(unit_price) AS p, quantity AS qv, unit_price AS pv
          FROM order_line WHERE order_id = 1`,
    );
    expect(rows[0].q).toBe("integer");
    expect(rows[0].qv).toBe(3);
    expect(["real", "numeric", "integer"]).toContain(rows[0].p);
    expect(rows[0].pv).toBeCloseTo(9.99, 2);
    const cols = await t.db.all<{ name: string; type: string }>(
      sql.raw("PRAGMA table_info(order_line)"),
    );
    expect(cols.find((c) => c.name === "quantity")?.type.toLowerCase()).toContain("int");
    expect(cols.find((c) => c.name === "unit_price")?.type.toLowerCase()).toMatch(
      /decimal|numeric|real|float|double/,
    );
  });
});

describe("order-fulfilment: orders and statuses", () => {
  // case: SWHM2-C-0181@v1
  it("[SWHM2-C-0181] order status view lists one row per order", async () => {
    await insertPo(7);
    await t.db.run(sql`INSERT INTO order_manager (order_id, status) VALUES (7, 'PENDING')`);
    const rows = await listOrderStatus(t.env);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ orderId: 7, userName: "j2ee", status: "PENDING" });
    expect(rows[0].value).toBe(10);
    expect(rows[0].date).toBeDefined();
  });

  // case: SWHM2-C-0196@v1
  it("[SWHM2-C-0196] a new supplier order is PENDING with the submitted id and date", async () => {
    await seedOrder("S1", [line(1, "EST-1", 1)]);
    const o = await getSupplierOrder(t.env, "S1");
    expect(o.status).toBe("PENDING");
    expect(o.orderId).toBe("S1");
    expect(o.date).toBe(NOW.getTime());
  });

  // case: SWHM2-C-0197@v1
  it("[SWHM2-C-0197] order creation makes one contact record and two line items", async () => {
    await seedOrder("S1", [line(1, "EST-1", 1), line(2, "EST-2", 1)]);
    const c = await t.db.all<{ n: number }>(sql`SELECT COUNT(*) AS n FROM contact_info`);
    const l = await t.db.all<{ n: number }>(
      sql`SELECT COUNT(*) AS n FROM supplier_order_line WHERE order_id = 'S1'`,
    );
    expect(c[0].n).toBe(1);
    expect(l[0].n).toBe(2);
  });

  // case: SWHM2-C-0198@v1
  it("[SWHM2-C-0198] search by PENDING returns only PENDING orders", async () => {
    await seedOrder("P1", [line(1, "EST-1", 1)]);
    await seedOrder("A1", [line(1, "EST-1", 1)]);
    await seedOrder("C1", [line(1, "EST-1", 1)]);
    await t.db.run(sql`UPDATE supplier_order SET status = 'APPROVED' WHERE order_id = 'A1'`);
    await t.db.run(sql`UPDATE supplier_order SET status = 'COMPLETED' WHERE order_id = 'C1'`);
    expect(await findOrdersByStatus(t.env, "PENDING")).toEqual(["P1"]);
  });

  // case: SWHM2-C-0199@v1
  it("[SWHM2-C-0199] only five statuses are recognised", () => {
    expect([...ORDER_STATUSES].sort()).toEqual(
      ["APPROVED", "COMPLETED", "DENIED", "PENDING", "SHIPPED_PART"].sort(),
    );
    expect(isOrderStatus("PENDING")).toBe(true);
    expect(isOrderStatus("LOST_IN_SPACE")).toBe(false);
  });

  // case: SWHM2-C-0201@v1
  it("[SWHM2-C-0201] approving a PENDING order gives APPROVED", async () => {
    await seedOrder("S1", [line(1, "EST-1", 1)]);
    await approveOrder(t.env, "S1");
    expect((await getSupplierOrder(t.env, "S1")).status).toBe("APPROVED");
  });

  // case: SWHM2-C-0202@v1
  it("[SWHM2-C-0202] shipping address equals billing address on read-back", async () => {
    await createPurchaseOrder(t.env, {
      orderId: "42",
      userName: "j2ee",
      shipping: SHIPPING,
      lines: [line(1, "EST-1", 1)],
    });
    const po = await getPurchaseOrder(t.env, "42");
    expect(po.shipping).toEqual(po.billing);
    expect(po.shipping.address).toBe(SHIPPING.address);
  });

  // case: SWHM2-C-0222@v1
  it("[SWHM2-C-0222] a contact record is created and associated with a new purchase order", async () => {
    await createPurchaseOrder(t.env, {
      orderId: "42",
      userName: "j2ee",
      shipping: SHIPPING,
      lines: [line(1, "EST-1", 1)],
    });
    const po = await getPurchaseOrder(t.env, "42");
    const rows = await t.db.all<{ email: string }>(
      sql`SELECT email FROM contact_info WHERE contact_id = ${po.contactId}`,
    );
    expect(rows).toEqual([{ email: SHIPPING.email }]);
  });

  // case: SWHM2-C-0203@v1
  it("[SWHM2-C-0203] a supplier PO is persisted with id, epoch date, status, contact and lines", async () => {
    await seedOrder("S1", [line(1, "EST-1", 2)]);
    const o = await getSupplierOrder(t.env, "S1");
    expect(o).toMatchObject({ orderId: "S1", date: NOW.getTime(), status: "PENDING" });
    expect(o.contactId).toBeDefined();
    expect(o.shipping).toMatchObject({ name: SHIPPING.name, email: SHIPPING.email });
    expect(o.lines).toHaveLength(1);
  });

  // case: SWHM2-C-0212@v1
  it("[SWHM2-C-0212] a persisted supplier PO has unique id, date, status, one contact and a line", async () => {
    await seedOrder("S1", [line(1, "EST-1", 2)]);
    await expect(seedOrder("S1", [line(1, "EST-1", 2)])).rejects.toThrow();
    const o = await getSupplierOrder(t.env, "S1");
    expect(o.status).toBe("PENDING");
    expect(typeof o.date).toBe("number");
    expect(o.contactId).toBeDefined();
    expect(o.lines.length).toBeGreaterThanOrEqual(1);
  });

  // case: SWHM2-C-0213@v1
  it("[SWHM2-C-0213] the retention purge removes the supplier order, its lines and its contact (the address holder)", async () => {
    await seedOrder("S1", [line(1, "EST-1", 2)]);
    await purgeSupplierOrders(t.env, ["S1"]);
    const o = await t.db.all(sql`SELECT * FROM supplier_order WHERE order_id = 'S1'`);
    const l = await t.db.all(sql`SELECT * FROM supplier_order_line WHERE order_id = 'S1'`);
    const c = await t.db.all(sql`SELECT * FROM contact_info`);
    expect([o.length, l.length, c.length]).toEqual([0, 0, 0]);
    const orphans = await t.db.all(sql`SELECT * FROM contact_info WHERE order_id = 'S1'`);
    expect(orphans).toHaveLength(0);
  });

  // case: SWHM2-C-0205@v1
  it("[SWHM2-C-0205] line items are returned as plain data outside the transaction", async () => {
    await seedOrder("S1", [line(1, "EST-1", 2, 5.5)]);
    const items = await getLineItems(t.env, "S1");
    expect(items).toHaveLength(1);
    expect(Object.getPrototypeOf(items[0])).toBe(Object.prototype);
    expect(JSON.parse(JSON.stringify(items[0]))).toMatchObject({ itemId: "EST-1", quantity: 2 });
  });

  // case: SWHM2-C-0218@v1
  it("[SWHM2-C-0218] a role-less caller can read line item data", async () => {
    await seedOrder("S1", [line(1, "EST-1", 2)]);
    expect(t.env.callerRole).toBeUndefined();
    await expect(getLineItems(t.env, "S1")).resolves.toHaveLength(1);
  });

  // case: SWHM2-C-0223@v1
  it("[SWHM2-C-0223] a role-less caller can invoke a purchase order operation", async () => {
    expect(t.env.callerRole).toBeUndefined();
    await expect(
      createPurchaseOrder(t.env, {
        orderId: "43",
        userName: "j2ee",
        shipping: SHIPPING,
        lines: [line(1, "EST-1", 1)],
      }),
    ).resolves.not.toThrow();
    expect((await getPurchaseOrder(t.env, "43")).orderId).toBe("43");
  });
});

describe("order-fulfilment: fulfilment", () => {
  // case: SWHM2-C-0182@v1
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

  // case: SWHM2-C-0185@v1
  it("[SWHM2-C-0185] an order with an unavailable line is partly shipped, not COMPLETED", async () => {
    await seedOrder("S1", [line(1, "EST-1", 1), line(2, "EST-2", 1)]);
    await setStock(t.db, "EST-1", 5);
    const result = await processOrder(t.env, "S1");
    expect(result.status).toBe("SHIPPED_PART");
    expect((await getSupplierOrder(t.env, "S1")).status).toBe("SHIPPED_PART");
    expect(await stockOf(t.db, "EST-1")).toBe(4);
    const lines = await t.db.all<{ line_num: number; quantity_shipped: number }>(
      sql`SELECT line_num, quantity_shipped FROM supplier_order_line WHERE order_id = 'S1' ORDER BY line_num`,
    );
    expect(lines).toEqual([
      { line_num: 1, quantity_shipped: 1 },
      { line_num: 2, quantity_shipped: 0 },
    ]);
  });

  // case: SWHM2-C-0187@v1
  it("[SWHM2-C-0187] insufficient stock leaves the line unfulfilled and stock at 4", async () => {
    await seedOrder("S1", [line(1, "EST-1", 10)]);
    await setStock(t.db, "EST-1", 4);
    expect((await fulfilLine(t.env, "S1", 1)).shipped).toBe(false);
    expect(await stockOf(t.db, "EST-1")).toBe(4);
  });

  // case: SWHM2-C-0190@v1
  it("[SWHM2-C-0190] a line for an item without an inventory record is not fulfilled", async () => {
    await seedOrder("S1", [line(1, "NO-STOCK", 1)]);
    expect((await fulfilLine(t.env, "S1", 1)).shipped).toBe(false);
  });

  // case: SWHM2-C-0191@v1
  it("[SWHM2-C-0191] a fully shipped line is skipped and stock is not reduced again", async () => {
    await seedOrder("S1", [line(1, "EST-1", 2)]);
    await setStock(t.db, "EST-1", 10);
    await t.db.run(
      sql`UPDATE supplier_order_line SET quantity_shipped = 2 WHERE order_id = 'S1' AND line_num = 1`,
    );
    await processOrder(t.env, "S1");
    expect(await stockOf(t.db, "EST-1")).toBe(10);
  });

  // case: SWHM2-C-0192@v1
  it("[SWHM2-C-0192] invoice generation failure returns no invoice and keeps the order pending", async () => {
    await seedOrder("S1", [line(1, "EST-1", 1)]);
    await setStock(t.db, "EST-1", 5);
    t.invoiceGeneration.fail = true;
    const result = await processOrder(t.env, "S1");
    expect(result.invoice).toBeNull();
    expect((await getSupplierOrder(t.env, "S1")).status).toBe("PENDING");
    expect(t.completed).toEqual([]);
  });

  // case: SWHM2-C-0193@v1
  it("[SWHM2-C-0193] an inventory update reprocesses only PENDING orders", async () => {
    await seedOrder("P1", [line(1, "EST-1", 1)]);
    await seedOrder("C1", [line(1, "EST-1", 1)]);
    await t.db.run(sql`UPDATE supplier_order SET status = 'COMPLETED' WHERE order_id = 'C1'`);
    await setStock(t.db, "EST-1", 0);
    await updateInventory(t.env, [{ itemId: "EST-1", checked: true, value: "5" }]);
    expect(t.reprocessed).toEqual(["P1"]);
  });

  // case: SWHM2-C-0194@v1
  it("[SWHM2-C-0194] blank and negative quantities are not applied", async () => {
    await setStock(t.db, "EST-1", 5);
    await updateInventory(t.env, [{ itemId: "EST-1", checked: true, value: "" }]);
    expect(await stockOf(t.db, "EST-1")).toBe(5);
    await updateInventory(t.env, [{ itemId: "EST-1", checked: true, value: "-3" }]);
    expect(await stockOf(t.db, "EST-1")).toBe(5);
    await updateInventory(t.env, [{ itemId: "EST-1", checked: true, value: "8" }]);
    expect(await stockOf(t.db, "EST-1")).toBe(8);
  });

  // case: SWHM2-C-0215@v1
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

  // case: SWHM2-C-0216@v1
  it("[SWHM2-C-0216] sufficient stock is reduced from 10 to 7 and the line ships", async () => {
    await seedOrder("S1", [line(1, "EST-1", 3)]);
    await setStock(t.db, "EST-1", 10);
    expect((await fulfilLine(t.env, "S1", 1)).shipped).toBe(true);
    expect(await stockOf(t.db, "EST-1")).toBe(7);
  });

  // case: SWHM2-C-0219@v1
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

  // case: SWHM2-C-0209@v1
  it("[SWHM2-C-0209] a supplier PO is sent only for the approved order", async () => {
    await processApproval(t.env, [
      { orderId: "OK1", approved: true },
      { orderId: "NO1", approved: false },
    ]);
    expect(t.supplierQueue).toHaveLength(1);
    expect(t.supplierQueue[0]).toContain("OK1");
    expect(t.supplierQueue[0]).not.toContain("NO1");
  });

  // case: SWHM2-C-0210@v1
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

  // case: SWHM2-C-0206@v1
  it("[SWHM2-C-0206] a counter creation failure raises an error", async () => {
    t.counterCreation.fail = true;
    await expect(nextId(t.env, "ORD")).rejects.toThrow();
  });

  // case: SWHM2-C-0207@v1
  it("[SWHM2-C-0207] identifier generation needs no role", async () => {
    expect(t.env.callerRole).toBeUndefined();
    const first = await nextId(t.env, "ORD");
    const second = await nextId(t.env, "ORD");
    expect(first).toBeTruthy();
    expect(second).not.toBe(first);
  });
});

describe("order-fulfilment: documents and parsing", () => {
  // case: SWHM2-C-0200@v1
  it("[SWHM2-C-0200] an order message without lines is rejected", () => {
    expect(() => parseSupplierOrderMessage(supplierOrderXml("S1", []))).toThrow();
    expect(() => parseSupplierOrderMessage(supplierOrderXml("S1", [["EST-1", 1]]))).not.toThrow();
  });

  // case: SWHM2-C-0204@v1
  it("[SWHM2-C-0204] SupplierOrder XML has order id, yyyy-MM-dd date, shipping and lines", () => {
    const xml = buildSupplierOrderXml({
      orderId: "S1",
      date: NOW,
      shipping: SHIPPING,
      lines: [line(1, "EST-1", 2)],
    });
    expect(xml).toMatch(/<SupplierOrder[\s>]/);
    expect(xml).toMatch(/<OrderId>S1<\/OrderId>/);
    expect(xml).toMatch(/<OrderDate>2026-11-18<\/OrderDate>/);
    expect(xml).toMatch(/<ShippingInfo[\s>]/);
    expect(xml.match(/<LineItem[\s>]/g)).toHaveLength(1);
  });

  // case: SWHM2-C-0208@v1
  it("[SWHM2-C-0208] a document failing DTD validation is rejected", () => {
    const bad = `<?xml version="1.0"?><!DOCTYPE Doc [<!ELEMENT Doc (A)><!ELEMENT A (#PCDATA)>]><Doc><B/></Doc>`;
    const good = `<?xml version="1.0"?><!DOCTYPE Doc [<!ELEMENT Doc (A)><!ELEMENT A (#PCDATA)>]><Doc><A>x</A></Doc>`;
    expect(() => parseDocument(bad, { validate: true })).toThrow();
    expect(() => parseDocument(good, { validate: true })).not.toThrow();
  });

  // case: SWHM2-C-0214@v1
  it("[SWHM2-C-0214] an unparseable order date defaults to today", () => {
    const parsed = parseSupplierOrderMessage(supplierOrderXml("S1", [["EST-1", 1]], "notadate"), {
      now: () => NOW,
    });
    expect(parsed.date.getTime()).toBe(NOW.getTime());
  });

  // case: SWHM2-C-0220@v1
  it("[SWHM2-C-0220] a line item carries category, product, item, line number, quantity and price", () => {
    const item = toLineItem({ ...line(2, "EST-1", 4, 5.5), quantityShipped: 0 });
    expect(item).toEqual({
      categoryId: "FISH",
      productId: "FI-SW",
      itemId: "EST-1",
      lineNum: 2,
      quantity: 4,
      unitPrice: 5.5,
    });
  });

  // case: SWHM2-C-0221@v1
  it("[SWHM2-C-0221] Invoice XML holds order id, user id, order date, shipping date and a line", () => {
    const xml = buildInvoiceXml({
      orderId: "S1",
      userId: "j2ee",
      orderDate: NOW,
      shippingDate: NOW,
      lines: [line(1, "EST-1", 1)],
    });
    expect(xml).toMatch(/<Invoice[\s>]/);
    expect(xml).toMatch(/<OrderId>S1<\/OrderId>/);
    expect(xml).toMatch(/<UserId>j2ee<\/UserId>/);
    expect(xml).toMatch(/<OrderDate>[^<]+<\/OrderDate>/);
    expect(xml).toMatch(/<ShippingDate>[^<]+<\/ShippingDate>/);
    expect(xml.match(/<LineItem[\s>]/g)!.length).toBeGreaterThanOrEqual(1);
  });
});
