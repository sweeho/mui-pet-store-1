import { sql } from "drizzle-orm";

import { forwardDecision } from "./decision";
import type { ApprovalEnv } from "./env";
import { recordOrderStatus } from "./orders";
import { canApprove } from "./policy";

export type ReceivedLine = {
  lineNum: number;
  categoryId: string | null;
  productId: string | null;
  itemId: string;
  quantity: number;
  unitPrice: number;
};

export type ReceivedOrder = {
  orderId: string | number;
  userName: string;
  locale: string;
  total: number;
  lines: ReceivedLine[];
};

/**
 * Store the order and its lines, register it PENDING, and forward an APPROVED decision only when
 * it qualifies (R-0079). The decision follows the same queue path as an administrator's.
 */
export async function receivePurchaseOrder(env: ApprovalEnv, order: ReceivedOrder): Promise<void> {
  const id = String(order.orderId);
  await env.db.run(
    sql`INSERT INTO purchase_order (order_id, user_name, order_time, locale, total_price, status)
        VALUES (${id}, ${order.userName}, ${env.now().getTime()}, ${order.locale},
                ${order.total}, 'PENDING')`,
  );
  for (const l of order.lines) {
    await env.db.run(
      sql`INSERT INTO order_line (order_id, line_num, category_id, product_id, item_id, quantity, unit_price)
          VALUES (${id}, ${l.lineNum}, ${l.categoryId}, ${l.productId}, ${l.itemId},
                  ${l.quantity}, ${l.unitPrice})`,
    );
  }
  await recordOrderStatus(env, id, "PENDING");
  if (canApprove({ locale: order.locale, total: order.total })) {
    await forwardDecision(env, id, "APPROVED");
  }
}
