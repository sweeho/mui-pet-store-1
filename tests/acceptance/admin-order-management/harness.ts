/**
 * Shared fixture for the admin-order-management acceptance tests. It is also the contract the
 * build must meet; every assumption about names lives here, not in the tests.
 *
 * Product modules (under src/admin/):
 *  - session.ts: createAdminSession(): Promise<string> returns the id of a new administrator
 *    session. A request carries it as the cookie `admin_session=<id>`.
 *  - orders.ts: listOrderOperations(db) reads the operations view (view v_order_status, an inner
 *    join of purchase_order to order_manager) as [{ orderId, userId, date, value, status }];
 *    listOrdersByStatus(db, status) returns [{ orderId, userId, date: "M/D/YYYY", value, status }],
 *    one entry per order.
 *  - reports.ts: salesReport(db, { start, end, type: "REVENUE" | "ORDERS", category? }) and
 *    getChartInfo(db, { start, end, type, category? }) resolve to { rows: [{ name, value }], total }
 *    or { error: string }. Dates are MM/dd/yyyy. rows are per category, or per item of `category`.
 *    REVENUE totals quantity * item list_price; any other type totals quantity.
 *  - launch.ts: buildLaunchDescriptor({ server, port, sessionId }) returns the Web Start (JNLP)
 *    text naming "Pet Store Admin" with the three values as arguments.
 * Route handlers:
 *  - POST /api/admin/appl (src/app/api/admin/appl/route.ts): the rich-client endpoint. Body is XML
 *    `<Request><Type>GETORDERS</Type><Status>PENDING</Status></Request>`. The reply is XML text:
 *    GETORDERS gives one <Order> element per order plus <Count>n</Count>; an unknown Type gives an
 *    error response whose text names the Type.
 *  - POST /api/admin/process (src/app/api/admin/process/route.ts): the admin home form, urlencoded
 *    `currentScreen=manageorders`; the reply is the launch descriptor text.
 * Tables (SQLite): purchase_order(order_id, user_name, order_time epoch ms, locale, total_price,
 * status), order_manager(order_id, status; no unique key), order_line(order_id, line_num, item_id,
 * quantity), category(category_id), product(product_id, category_id), item(item_id, product_id,
 * list_price, unit_cost).
 */
import { sql } from "drizzle-orm";

import { getDb } from "@/db/client";

export type Db = Awaited<ReturnType<typeof getDb>>;

export const SESSION_TIMEOUT_MESSAGE =
  "Session Timed Out; Please exit and login as admin from the login page";

export async function resetData(db: Db): Promise<void> {
  for (const t of [
    "order_manager",
    "order_line",
    "purchase_order",
    "item",
    "product",
    "category",
  ]) {
    await db.run(sql.raw(`DELETE FROM ${t}`));
  }
}

export async function insertOrder(
  db: Db,
  o: {
    id: number;
    user?: string;
    time?: Date;
    total?: number;
    /** Status rows in order_manager; none leaves the order without a process-manager status. */
    statuses?: string[];
    lines?: { item: string; quantity: number }[];
  },
): Promise<void> {
  const time = (o.time ?? new Date(2020, 0, 15, 12)).getTime();
  const statuses = o.statuses ?? [];
  await db.run(
    sql`INSERT INTO purchase_order (order_id, user_name, order_time, locale, total_price, status)
        VALUES (${o.id}, ${o.user ?? "j2ee"}, ${time}, 'en_US', ${o.total ?? 10}, ${statuses[0] ?? "NEW"})`,
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

export async function insertItem(
  db: Db,
  i: { id: string; category: string; price: number },
): Promise<void> {
  const product = `P-${i.category}`;
  await db.run(sql`INSERT OR IGNORE INTO category (category_id) VALUES (${i.category})`);
  await db.run(
    sql`INSERT OR IGNORE INTO product (product_id, category_id) VALUES (${product}, ${i.category})`,
  );
  await db.run(
    sql`INSERT INTO item (item_id, product_id, list_price, unit_cost)
        VALUES (${i.id}, ${product}, ${i.price}, 1)`,
  );
}

export function xmlRequest(type: string, status?: string): string {
  const s = status ? `<Status>${status}</Status>` : "";
  return `<Request><Type>${type}</Type>${s}</Request>`;
}

export function appRequest(url: string, body: string, contentType: string, session?: string) {
  return new Request(`http://localhost${url}`, {
    method: "POST",
    headers: {
      "content-type": contentType,
      ...(session ? { cookie: `admin_session=${session}` } : {}),
    },
    body,
  });
}
