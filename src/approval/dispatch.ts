import { sql } from "drizzle-orm";

import { dispatchFulfilment } from "@/fulfilment/dispatch";
import { newFulfilEnv, type Db } from "@/fulfilment/env";

import type { ApprovalEnv } from "./env";
import { parseApprovalXml } from "./documents";
import { processApprovalMessage } from "./handler";

export const QUEUES = {
  approval: "order-approval",
  supplier: "supplier-purchase-order",
  notification: "customer-notification",
} as const;

async function record(env: ApprovalEnv, queue: string, orderId: string, body: string) {
  await env.db.run(
    sql`INSERT INTO message_outbox (queue, origin, order_id, body, created_at)
        VALUES (${queue}, ${env.origin ?? "auto"}, ${orderId}, ${body}, ${env.now().getTime()})`,
  );
}

const orderIdOf = (xml: string) => /<OrderId>([^<]*)<\/OrderId>/.exec(xml)?.[1] ?? "";

/**
 * The in-process consumer of the approval queue (design.md P3): records each message, processes
 * it, then records every supplier purchase order and notification it produced.
 */
export async function dispatchApprovals(env: ApprovalEnv): Promise<void> {
  for (let msg = env.approvalQueue.shift(); msg !== undefined; msg = env.approvalQueue.shift()) {
    await record(env, QUEUES.approval, parseApprovalXml(msg)[0]?.orderId ?? "", msg);
    await processApprovalMessage(env, msg);
  }
  const supplier = env.supplierQueue.splice(0);
  for (const body of supplier) {
    await record(env, QUEUES.supplier, orderIdOf(body), body);
  }
  if (supplier.length > 0) {
    // Hand each supplier purchase order to fulfilment (design.md P6).
    const fulfil = newFulfilEnv(env.db as Db);
    fulfil.now = env.now;
    fulfil.supplierQueue.push(...supplier);
    await dispatchFulfilment(fulfil, env.origin ?? "auto");
  }
  for (const orderId of env.notifyList.splice(0)) {
    await record(env, QUEUES.notification, orderId, orderId);
  }
}
