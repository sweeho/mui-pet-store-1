/**
 * Shared fixture for the order-approval acceptance tests. It is also the contract the build must
 * meet; every assumption about names lives here, not in the tests.
 *
 * Product modules (under src/approval/), every function async unless noted; `env` is ApprovalEnv
 * (shape built by makeEnv below):
 *  - orders.ts: ORDER_STATUSES (exactly PENDING, APPROVED, DENIED, COMPLETED);
 *    recordOrderStatus(env, orderId, status) writes the process-manager row (order_manager) and
 *    rejects a value outside ORDER_STATUSES; getOrderStatus(env, orderId) -> string | undefined.
 *  - policy.ts (sync): canApprove({locale, total}) -> boolean. US (locale "en_US") below 500 and
 *    Japan (locale "ja_JP") below 50000, strictly; any other locale is false.
 *  - receive.ts: receivePurchaseOrder(env, {orderId, userName, locale, total, lines}) stores the
 *    purchase order and its lines, registers it PENDING and, only when canApprove, forwards an
 *    APPROVED decision to env.approvalQueue.
 *  - decision.ts: forwardDecision(env, orderId, "APPROVED" | "DENIED") puts one order-approval
 *    message (XML text, root OrderApproval) on env.approvalQueue.
 *  - handler.ts: processApprovalMessage(env, xml) handles each <Order> entry: only a PENDING order
 *    is changed; it gets the decided status, is added to env.notifyList (order ids) and, when
 *    APPROVED, one supplier purchase order text (containing the order id and one <LineItem> per
 *    order line) is pushed on env.supplierQueue. Other orders are ignored entirely.
 *  - env: {db, now, approvalQueue: string[], supplierQueue: string[], notifyList: string[]}.
 * Tables (SQLite): purchase_order(order_id, user_name, order_time, locale, total_price, status),
 * order_manager(order_id, status), order_line(order_id, line_num, category_id, product_id,
 * item_id, quantity, unit_price).
 * Browser: /admin/orders (signed in at /admin/login) lists one row per order carrying
 * data-order-id and data-status. A PENDING row offers Approve and Deny buttons; other rows offer
 * none. A Commit button sends one message per changed order. GET /api/admin/approvals/sent
 * returns JSON {messages: [{orderId, status}]} of what Commit has sent. The seeded data holds at
 * least three PENDING orders and one APPROVED order.
 */
import { sql } from "drizzle-orm";

import { getDb } from "@/db/client";
import type { ApprovalEnv } from "@/approval/env";

export type Db = Awaited<ReturnType<typeof getDb>>;

export interface TestEnv {
  env: ApprovalEnv;
  db: Db;
  approvalQueue: string[];
  supplierQueue: string[];
  notifyList: string[];
}

export async function makeEnv(): Promise<TestEnv> {
  const db = await getDb();
  const approvalQueue: string[] = [];
  const supplierQueue: string[] = [];
  const notifyList: string[] = [];
  const env = {
    db,
    now: () => new Date(2026, 10, 18, 9, 0, 0),
    approvalQueue,
    supplierQueue,
    notifyList,
  } as unknown as ApprovalEnv;
  return { env, db, approvalQueue, supplierQueue, notifyList };
}

export async function resetData(db: Db): Promise<void> {
  for (const t of ["order_manager", "order_line", "purchase_order"]) {
    await db.run(sql.raw(`DELETE FROM ${t}`));
  }
}

/** Seeds an order with the given status and `lineCount` lines. */
export async function seedOrder(db: Db, id: number, status: string, lineCount = 2): Promise<void> {
  await db.run(
    sql`INSERT INTO purchase_order (order_id, user_name, order_time, locale, total_price, status)
        VALUES (${id}, 'j2ee', ${Date.UTC(2026, 10, 18)}, 'en_US', 1000, ${status})`,
  );
  await db.run(sql`INSERT INTO order_manager (order_id, status) VALUES (${id}, ${status})`);
  for (let n = 1; n <= lineCount; n++) {
    await db.run(
      sql`INSERT INTO order_line (order_id, line_num, category_id, product_id, item_id, quantity, unit_price)
          VALUES (${id}, ${n}, 'FISH', 'FI-SW', ${`EST-${n}`}, 2, 9.99)`,
    );
  }
}

export function po(orderId: number, locale: string, total: number) {
  return {
    orderId,
    userName: "j2ee",
    locale,
    total,
    lines: [
      {
        lineNum: 1,
        categoryId: "FISH",
        productId: "FI-SW",
        itemId: "EST-1",
        quantity: 1,
        unitPrice: total,
      },
    ],
  };
}

export function approvalXml(entries: [number, "APPROVED" | "DENIED"][]): string {
  const orders = entries
    .map(([id, s]) => `<Order><OrderId>${id}</OrderId><OrderStatus>${s}</OrderStatus></Order>`)
    .join("");
  return `<OrderApproval>${orders}</OrderApproval>`;
}

export async function rejects(p: Promise<unknown>): Promise<boolean> {
  try {
    await p;
    return false;
  } catch {
    return true;
  }
}
