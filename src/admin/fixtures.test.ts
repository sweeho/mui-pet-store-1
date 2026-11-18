import { sql } from "drizzle-orm";

import type { Exec } from "@/accounts/store";

/** Test fixtures on the real schema (orders, status rows, catalog with per-locale prices). */
export async function clearOrders(db: Exec): Promise<void> {
  for (const t of ["order_manager", "order_line", "purchase_order", "item_details", "item"]) {
    await db.run(sql.raw(`DELETE FROM ${t}`));
  }
}

export async function addOrder(
  db: Exec,
  o: {
    id: number;
    user?: string;
    time?: Date;
    total?: number;
    statuses?: string[];
    lines?: { item: string; quantity: number }[];
  },
): Promise<void> {
  const statuses = o.statuses ?? [];
  await db.run(
    sql`INSERT INTO purchase_order (order_id, user_name, order_time, locale, total_price, status)
        VALUES (${o.id}, ${o.user ?? "j2ee"}, ${(o.time ?? new Date(2020, 0, 15, 12)).getTime()}, 'en_US', ${o.total ?? 10}, ${statuses[0] ?? "NEW"})`,
  );
  for (const s of statuses) {
    await db.run(sql`INSERT INTO order_manager (order_id, status) VALUES (${o.id}, ${s})`);
  }
  let n = 1;
  for (const l of o.lines ?? []) {
    await db.run(
      sql`INSERT INTO order_line (order_id, line_num, item_id, quantity) VALUES (${o.id}, ${n++}, ${l.item}, ${l.quantity})`,
    );
  }
}

export async function addItem(
  db: Exec,
  i: { id: string; category: string; price: number },
): Promise<void> {
  const product = `P-${i.category}`;
  await db.run(sql`INSERT OR IGNORE INTO category (catid) VALUES (${i.category})`);
  await db.run(
    sql`INSERT OR IGNORE INTO product (productid, catid) VALUES (${product}, ${i.category})`,
  );
  await db.run(sql`INSERT INTO item (itemid, productid) VALUES (${i.id}, ${product})`);
  await db.run(
    sql`INSERT INTO item_details (itemid, locale, list_price, unit_cost, image, descn)
        VALUES (${i.id}, 'en_US', ${i.price}, 1, 'x.png', 'd')`,
  );
}

test("fixtures module loads", () => {
  expect(typeof addItem).toBe("function");
});
