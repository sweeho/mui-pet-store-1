/**
 * Shared fixture for the order-notifications acceptance tests. It is also the contract the build
 * must meet; every assumption about names lives here, not in the tests.
 *
 * Product modules (all under src/notifications/), every function async unless noted:
 *  - broker.ts: createBroker() -> { queue(name): { messages: string[] }, topic(name): { published:
 *    string[] }, begin(): Tx }. Tx has commit() and rollback(). Queue names: QUEUES below.
 *  - sender.ts: sendMessage(env, queueName, text, tx?). Without tx the text is placed on the queue
 *    at once; with tx it is placed only when tx.commit() runs, and dropped on tx.rollback().
 *  - mail-document.ts (sync): buildMailDocument({address, subject, content}) -> XML string
 *    <Mail><Address/><Subject/><Content/></Mail>; parseMailDocument(xml) -> {address, subject,
 *    content}, throwing when the structure is not exactly those three parts in that order.
 *  - order-approval.ts (sync): buildOrderApproval([{orderId, approved}]) -> XML string with root
 *    <OrderApproval> and one <Order> child per entry; parseOrderApproval(xml, {validate: true})
 *    throws when the root is not OrderApproval.
 *  - mailer.ts: processMailMessage(env, xml). Throws when xml is not a valid mail document.
 *    Otherwise sends one HTML message through env.transport.send({from, to: string[], subject,
 *    html, sentDate, headers}) and resolves; when transport.send rejects it logs via env.log,
 *    does not retry and resolves.
 *  - locator.ts: createLocator(lookup: (name) => Promise<unknown>) -> { get(name) } caching by name;
 *    LocatorError has .cause.
 *  - order-flow.ts: submitPurchaseOrder(env, po) -> {billingEmail, orderId}; issueInvoice(env,
 *    invoiceXml); processInvoice(env, {orderId, completesOrder}); changeOrderStatus(env, orderId,
 *    status).
 *  - env.ts: the NotifEnv type (shape built by makeEnv below): broker, transport, log, now,
 *    defaultSender, cart (string[]), orders (Map orderId -> {email, locale}), switches
 *    {statusChange, invoice, completed} (all default false).
 */
import { createBroker } from "@/notifications/broker";
import type { NotifEnv } from "@/notifications/env";

export const QUEUES = {
  orders: "opc-order",
  asyncSender: "async-sender",
  completedMail: "completed-order-mail",
  mail: "mail",
} as const;
export const INVOICE_TOPIC = "invoice";

export interface SentMail {
  from: string;
  to: string[];
  subject: string;
  html: string;
  sentDate: Date;
  headers: Record<string, string>;
  locale?: string;
}

export interface TestEnv {
  env: NotifEnv;
  sent: SentMail[];
  logs: string[];
  attempts: { count: number };
  transport: { unreachable: boolean };
}

export const NOW = new Date(2026, 10, 18, 9, 0, 0);

export function makeEnv(): TestEnv {
  const sent: SentMail[] = [];
  const logs: string[] = [];
  const attempts = { count: 0 };
  const transport = { unreachable: false };
  const env = {
    broker: createBroker(),
    transport: {
      send: async (m: SentMail) => {
        attempts.count += 1;
        if (transport.unreachable) throw new Error("mail server unreachable");
        sent.push(m);
      },
    },
    log: (line: string) => logs.push(line),
    now: () => NOW,
    defaultSender: "petstore@example.com",
    cart: ["FI-SW-01", "K9-BD-01"],
    orders: new Map<string, { email: string; locale: string }>([
      ["42", { email: "buyer@example.com", locale: "fr_FR" }],
    ]),
    switches: { statusChange: false, invoice: false, completed: false },
  } as unknown as NotifEnv;
  return { env, sent, logs, attempts, transport };
}

export function mailXml(address: string, subject: string, content: string): string {
  return `<Mail><Address>${address}</Address><Subject>${subject}</Subject><Content>${content}</Content></Mail>`;
}
