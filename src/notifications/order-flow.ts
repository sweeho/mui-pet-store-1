import { escapeXml } from "@/approval/documents";
import { xmlText } from "@/fulfilment/documents";

import type { NotifEnv } from "./env";
import { buildMailDocument } from "./mail-document";
import { sendMessage } from "./sender";

export const QUEUES = {
  orders: "opc-order",
  completedMail: "completed-order-mail",
  mail: "mail",
} as const;
export const INVOICE_TOPIC = "invoice";

export type PurchaseOrder = { orderId: string; billingEmail: string; items: string[] };

/** Send the purchase order as XML to the processing centre, empty the cart, return the receipt. */
export async function submitPurchaseOrder(env: NotifEnv, po: PurchaseOrder) {
  const items = po.items.map((i) => `<Item>${escapeXml(i)}</Item>`).join("");
  await sendMessage(
    env,
    QUEUES.orders,
    `<PurchaseOrder><OrderId>${escapeXml(po.orderId)}</OrderId><Email>${escapeXml(po.billingEmail)}</Email>${items}</PurchaseOrder>`,
  );
  env.cart.splice(0);
  return { billingEmail: po.billingEmail, orderId: po.orderId };
}

/** Queue one mail to the order's stored address and locale; nothing when the order is unknown. */
async function queueOrderMail(env: NotifEnv, orderId: string, subject: string, line: string) {
  const order = env.orders.get(orderId);
  if (!order) return;
  await sendMessage(
    env,
    QUEUES.mail,
    buildMailDocument({
      address: order.email,
      subject,
      content: `<p>${line}</p>`,
      locale: order.locale,
    }),
  );
}

export async function issueInvoice(env: NotifEnv, invoiceXml: string): Promise<void> {
  env.broker.topic(INVOICE_TOPIC).published.push(invoiceXml);
  const orderId = xmlText(invoiceXml, "OrderId");
  if (env.switches.invoice && orderId !== undefined) {
    await queueOrderMail(
      env,
      orderId,
      `Java Pet Store Order Shipped: ${orderId}`,
      `Order ${escapeXml(orderId)} has shipped.`,
    );
  }
}

/** The queue is the trigger, whatever the switches say: only a completing invoice sends. */
export async function processInvoice(
  env: NotifEnv,
  invoice: { orderId: string; completesOrder: boolean },
): Promise<void> {
  if (invoice.completesOrder) await sendMessage(env, QUEUES.completedMail, invoice.orderId);
}

export async function sendCompletedOrderMail(env: NotifEnv, orderId: string): Promise<void> {
  if (!env.switches.completed) return;
  await queueOrderMail(
    env,
    orderId,
    `Java Pet Store Order COMPLETED: ${orderId}`,
    `Order ${escapeXml(orderId)} is completed.`,
  );
}

export async function changeOrderStatus(
  env: NotifEnv,
  orderId: string,
  status: string,
): Promise<void> {
  if (!env.switches.statusChange) return;
  await queueOrderMail(
    env,
    orderId,
    `Java Pet Store Order Status: ${orderId}`,
    `Order ${escapeXml(orderId)} is now ${escapeXml(status)}.`,
  );
}
