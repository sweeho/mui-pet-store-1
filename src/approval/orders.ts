import { sql } from "drizzle-orm";

import type { ApprovalEnv } from "./env";

export const ORDER_STATUSES = ["PENDING", "APPROVED", "DENIED", "COMPLETED"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const isOrderStatus = (s: string): s is OrderStatus =>
  (ORDER_STATUSES as readonly string[]).includes(s);

/**
 * Write the process-manager status of an order (design.md P1, P2): every `order_manager` row of
 * the order, or a new one; the purchase order mirrors it. A value outside the four rejects.
 */
export async function recordOrderStatus(
  env: ApprovalEnv,
  orderId: string | number,
  status: string,
): Promise<void> {
  if (!isOrderStatus(status)) throw new Error(`invalid order status: ${status}`);
  const id = String(orderId);
  const updated = await env.db.all(
    sql`UPDATE order_manager SET status = ${status} WHERE order_id = ${id} RETURNING order_id`,
  );
  if (updated.length === 0) {
    await env.db.run(sql`INSERT INTO order_manager (order_id, status) VALUES (${id}, ${status})`);
  }
  await env.db.run(sql`UPDATE purchase_order SET status = ${status} WHERE order_id = ${id}`);
}

/** The latest status of an order, or undefined when it is not registered. */
export async function getOrderStatus(
  env: ApprovalEnv,
  orderId: string | number,
): Promise<string | undefined> {
  const rows = (await env.db.all(
    sql`SELECT status FROM order_manager WHERE order_id = ${String(orderId)}
        ORDER BY rowid DESC LIMIT 1`,
  )) as { status: string }[];
  return rows[0]?.status;
}
