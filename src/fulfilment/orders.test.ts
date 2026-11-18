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
} from "./orders";

import {
  NOW,
  SHIPPING,
  line,
  makeEnv,
  resetData,
  supplierOrderXml,
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

async function insertPo(id: number) {
  await t.db.run(
    sql`INSERT INTO purchase_order (order_id, user_name, order_time, locale, total_price, status)
        VALUES (${id}, 'j2ee', ${NOW.getTime()}, 'en_US', 10, 'PENDING')`,
  );
}

describe("supplier and purchase orders", () => {
  it("[SWHM2-C-0181] order status view lists one row per order", async () => {
    await insertPo(7);
    await t.db.run(sql`INSERT INTO order_manager (order_id, status) VALUES (7, 'PENDING')`);
    const rows = await listOrderStatus(t.env);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ orderId: 7, userName: "j2ee", status: "PENDING" });
    expect(rows[0].value).toBe(10);
    expect(rows[0].date).toBeDefined();
  });

  it("[SWHM2-C-0196] a new supplier order is PENDING with the submitted id and date", async () => {
    await seedOrder("S1", [line(1, "EST-1", 1)]);
    const o = await getSupplierOrder(t.env, "S1");
    expect(o.status).toBe("PENDING");
    expect(o.orderId).toBe("S1");
    expect(o.date).toBe(NOW.getTime());
  });

  it("[SWHM2-C-0197] order creation makes one contact record and two line items", async () => {
    await seedOrder("S1", [line(1, "EST-1", 1), line(2, "EST-2", 1)]);
    const c = await t.db.all<{ n: number }>(sql`SELECT COUNT(*) AS n FROM contact_info`);
    const l = await t.db.all<{ n: number }>(
      sql`SELECT COUNT(*) AS n FROM supplier_order_line WHERE order_id = 'S1'`,
    );
    expect(c[0].n).toBe(1);
    expect(l[0].n).toBe(2);
  });

  it("[SWHM2-C-0198] search by PENDING returns only PENDING orders", async () => {
    await seedOrder("P1", [line(1, "EST-1", 1)]);
    await seedOrder("A1", [line(1, "EST-1", 1)]);
    await seedOrder("C1", [line(1, "EST-1", 1)]);
    await t.db.run(sql`UPDATE supplier_order SET status = 'APPROVED' WHERE order_id = 'A1'`);
    await t.db.run(sql`UPDATE supplier_order SET status = 'COMPLETED' WHERE order_id = 'C1'`);
    expect(await findOrdersByStatus(t.env, "PENDING")).toEqual(["P1"]);
  });

  it("[SWHM2-C-0199] only five statuses are recognised", () => {
    expect([...ORDER_STATUSES].sort()).toEqual(
      ["APPROVED", "COMPLETED", "DENIED", "PENDING", "SHIPPED_PART"].sort(),
    );
    expect(isOrderStatus("PENDING")).toBe(true);
    expect(isOrderStatus("LOST_IN_SPACE")).toBe(false);
  });

  it("[SWHM2-C-0201] approving a PENDING order gives APPROVED", async () => {
    await seedOrder("S1", [line(1, "EST-1", 1)]);
    await approveOrder(t.env, "S1");
    expect((await getSupplierOrder(t.env, "S1")).status).toBe("APPROVED");
  });

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

  it("[SWHM2-C-0203] a supplier PO is persisted with id, epoch date, status, contact and lines", async () => {
    await seedOrder("S1", [line(1, "EST-1", 2)]);
    const o = await getSupplierOrder(t.env, "S1");
    expect(o).toMatchObject({ orderId: "S1", date: NOW.getTime(), status: "PENDING" });
    expect(o.contactId).toBeDefined();
    expect(o.shipping).toMatchObject({ name: SHIPPING.name, email: SHIPPING.email });
    expect(o.lines).toHaveLength(1);
  });

  it("[SWHM2-C-0212] a persisted supplier PO has unique id, date, status, one contact and a line", async () => {
    await seedOrder("S1", [line(1, "EST-1", 2)]);
    await expect(seedOrder("S1", [line(1, "EST-1", 2)])).rejects.toThrow();
    const o = await getSupplierOrder(t.env, "S1");
    expect(o.status).toBe("PENDING");
    expect(typeof o.date).toBe("number");
    expect(o.contactId).toBeDefined();
    expect(o.lines.length).toBeGreaterThanOrEqual(1);
  });

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

  it("[SWHM2-C-0205] line items are returned as plain data outside the transaction", async () => {
    await seedOrder("S1", [line(1, "EST-1", 2, 5.5)]);
    const items = await getLineItems(t.env, "S1");
    expect(items).toHaveLength(1);
    expect(Object.getPrototypeOf(items[0])).toBe(Object.prototype);
    expect(JSON.parse(JSON.stringify(items[0]))).toMatchObject({ itemId: "EST-1", quantity: 2 });
    // the transaction has ended: deleting the rows afterwards must not affect the returned data
    await purgeSupplierOrders(t.env, ["S1"]);
    expect(
      await t.db.all(sql`SELECT * FROM supplier_order_line WHERE order_id = 'S1'`),
    ).toHaveLength(0);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ itemId: "EST-1", quantity: 2 });
  });

  it("[SWHM2-C-0218] a role-less caller can read line item data", async () => {
    await seedOrder("S1", [line(1, "EST-1", 2)]);
    expect(t.env.callerRole).toBeUndefined();
    await expect(getLineItems(t.env, "S1")).resolves.toHaveLength(1);
  });

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

  it("[SWHM2-C-0200] an order message without lines is rejected", () => {
    expect(() => parseSupplierOrderMessage(supplierOrderXml("S1", []))).toThrow();
    expect(() => parseSupplierOrderMessage(supplierOrderXml("S1", [["EST-1", 1]]))).not.toThrow();
  });

  it("[SWHM2-C-0214] an unparseable order date defaults to today", () => {
    const parsed = parseSupplierOrderMessage(supplierOrderXml("S1", [["EST-1", 1]], "notadate"), {
      now: () => NOW,
    });
    expect(parsed.date.getTime()).toBe(NOW.getTime());
  });
});
