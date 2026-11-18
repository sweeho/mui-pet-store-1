import { sql } from "drizzle-orm";

import { notifyOrders } from "@/notifications/runtime";

import { xmlText } from "./documents";
import type { FulfilEnv } from "./env";
import { receiveSupplierOrder } from "./fulfilment";

export const QUEUES = {
  invoice: "supplier-invoice",
  completed: "completed-order",
} as const;

async function record(
  env: FulfilEnv,
  origin: string,
  queue: string,
  orderId: string,
  body: string,
): Promise<void> {
  await env.db.run(
    sql`INSERT INTO message_outbox (queue, origin, order_id, body, created_at)
        VALUES (${queue}, ${origin}, ${orderId}, ${body}, ${env.now().getTime()})`,
  );
}

/**
 * The in-process consumer of the fulfilment queues (design.md P6): receives each supplier
 * purchase order, then records every invoice and completed-order notification produced, here or
 * by an inventory update, in `message_outbox`. A message that cannot be received (an invalid
 * document, an id already stored) is dropped, so it never blocks the caller.
 */
export async function dispatchFulfilment(env: FulfilEnv, origin = "auto"): Promise<void> {
  for (const xml of env.supplierQueue.splice(0)) {
    try {
      await receiveSupplierOrder(env, xml);
    } catch {
      // Dropped: see above.
    }
  }
  const invoices = env.invoiceQueue?.splice(0) ?? [];
  for (const xml of invoices) {
    await record(env, origin, QUEUES.invoice, xmlText(xml, "OrderId") ?? "", xml);
  }
  const completed = env.completedOrderQueue.splice(0);
  for (const orderId of completed) {
    await record(env, origin, QUEUES.completed, orderId, orderId);
  }
  await notifyOrders(env.db, { invoices, completed }); // best-effort: never throws
}
