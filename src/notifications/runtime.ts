import { sql } from "drizzle-orm";

import type { Exec } from "@/accounts/store";

import { createBroker } from "./broker";
import type { NotifEnv } from "./env";
import { processMailMessage } from "./mailer";
import { changeOrderStatus, issueInvoice, QUEUES, sendCompletedOrderMail } from "./order-flow";
import { xmlText } from "@/fulfilment/documents";

export type NotifyEvents = { statuses?: string[]; invoices?: string[]; completed?: string[] };

/** Deployment settings (SD10): only the exact value "true" turns a switch on. */
const on = (name: string) => process.env[name] === "true";

/**
 * Mail for the orders a dispatcher just handled (design.md P8). Best-effort: it catches and logs
 * everything, so it never throws into the caller. With no mail server configured (SD8) a mail is
 * logged and dropped.
 */
export async function notifyOrders(db: Exec, events: NotifyEvents): Promise<void> {
  try {
    const switches = {
      statusChange: on("NOTIFY_STATUS_CHANGE"),
      invoice: on("NOTIFY_INVOICE"),
      completed: on("NOTIFY_COMPLETED"),
    };
    const invoices = events.invoices ?? [];
    const ids = [
      ...(events.statuses ?? []),
      ...(events.completed ?? []),
      ...invoices.map((x) => xmlText(x, "OrderId") ?? ""),
    ].filter(Boolean);
    const env: NotifEnv = {
      broker: createBroker(),
      transport: {
        send: async () => {
          throw new Error("no mail server configured");
        },
      },
      log: (line) => console.error(`[notifications] ${line}`),
      now: () => new Date(),
      defaultSender: process.env.MAIL_FROM ?? "petstore@localhost",
      cart: [],
      orders: new Map(),
      switches,
    };
    if (ids.length === 0 || !(switches.statusChange || switches.invoice || switches.completed)) {
      return;
    }
    for (const id of new Set(ids)) {
      const rows = (await db.all(
        sql`SELECT email_address, locale FROM checkout_order WHERE order_id = ${id}`,
      )) as { email_address: string; locale: string }[];
      if (rows[0]) env.orders.set(id, { email: rows[0].email_address, locale: rows[0].locale });
    }
    for (const id of events.statuses ?? []) await changeOrderStatus(env, id, "UPDATED");
    for (const xml of invoices) await issueInvoice(env, xml);
    for (const id of events.completed ?? []) await sendCompletedOrderMail(env, id);
    for (const xml of env.broker.queue(QUEUES.mail).messages.splice(0)) {
      await processMailMessage(env, xml);
    }
  } catch (e) {
    console.error(`[notifications] ${e instanceof Error ? e.message : String(e)}`);
  }
}
