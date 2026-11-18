/** @jest-environment node */
import { useIsolatedDatabase } from "@/db/isolated";
import { sql } from "drizzle-orm";

import {
  NOW,
  indexedColumns,
  line,
  makeEnv,
  rejects,
  resetData,
  setStock,
  stockOf,
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

async function insertPo(id: number) {
  await t.db.run(
    sql`INSERT INTO purchase_order (order_id, user_name, order_time, locale, total_price, status)
        VALUES (${id}, 'j2ee', ${NOW.getTime()}, 'en_US', 10, 'PENDING')`,
  );
}

describe("fulfilment data model", () => {
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

  it("[SWHM2-C-0176] purchase order has an index on the user column", async () => {
    expect(await indexedColumns(t.db, "purchase_order")).toContain("user_name");
  });

  it("[SWHM2-C-0177] purchase order has an index on the date column", async () => {
    expect(await indexedColumns(t.db, "purchase_order")).toContain("order_time");
  });

  it("[SWHM2-C-0178] order manager has an index on the status column", async () => {
    expect(await indexedColumns(t.db, "order_manager")).toContain("status");
  });

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

  it("[SWHM2-C-0183] a counter name has exactly one row with an integer value", async () => {
    await t.db.run(sql`INSERT INTO counter (name, value) VALUES ('order', 5)`);
    expect(
      await rejects(t.db.run(sql`INSERT INTO counter (name, value) VALUES ('order', 6)`)),
    ).toBe(true);
    const rows = await t.db.all<{ value: number }>(
      sql`SELECT value FROM counter WHERE name = 'order'`,
    );
    expect(rows).toEqual([{ value: 5 }]);
    expect(
      await rejects(t.db.run(sql`INSERT INTO counter (name, value) VALUES ('other', 1.5)`)),
    ).toBe(true);
    expect(
      await rejects(t.db.run(sql`INSERT INTO counter (name, value) VALUES ('other', 'abc')`)),
    ).toBe(true);
  });

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

  it("[SWHM2-C-0189] a stock update leaving negative stock is rejected", async () => {
    await setStock(t.db, "I", 2);
    expect(
      await rejects(
        t.db.run(sql`UPDATE inventory SET quantity = quantity - 3 WHERE item_id = 'I'`),
      ),
    ).toBe(true);
    expect(await stockOf(t.db, "I")).toBe(2);
  });

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
