import { sql } from "drizzle-orm";

import type { ApprovalEnv } from "./env";
import { parseApprovalXml } from "./documents";
import { getOrderStatus, recordOrderStatus } from "./orders";
import { buildSupplierOrderXml } from "./supplier";

/**
 * Handle each `<Order>` entry of an approval message: only a PENDING order changes (R-0172,
 * R-0176). It gets the decided status, goes on the notification list, and an APPROVED order also
 * gets a supplier purchase order. Every other order is ignored entirely.
 */
export async function processApprovalMessage(env: ApprovalEnv, xml: string): Promise<void> {
  for (const entry of parseApprovalXml(xml)) {
    if (entry.status !== "APPROVED" && entry.status !== "DENIED") continue;
    if ((await getOrderStatus(env, entry.orderId)) !== "PENDING") continue;
    // Claim the order with a conditional write so two racing messages cannot both change it.
    const claimed = await env.db.all(
      sql`UPDATE order_manager SET status = ${entry.status}
          WHERE order_id = ${entry.orderId} AND status = 'PENDING' RETURNING order_id`,
    );
    if (claimed.length === 0) continue;
    await recordOrderStatus(env, entry.orderId, entry.status);
    env.notifyList.push(entry.orderId);
    if (entry.status === "APPROVED") {
      env.supplierQueue.push(await buildSupplierOrderXml(env, entry.orderId));
    }
  }
}
