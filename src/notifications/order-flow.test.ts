/** @jest-environment node */
import {
  changeOrderStatus,
  issueInvoice,
  processInvoice,
  sendCompletedOrderMail,
  submitPurchaseOrder,
} from "./order-flow";
import { parseMailDocument } from "./mail-document";
import { processMailMessage } from "./mailer";
import {
  INVOICE_TOPIC,
  QUEUES,
  makeEnv,
  NOW,
} from "../../tests/acceptance/order-notifications/harness";

const mailQueue = (t: ReturnType<typeof makeEnv>) => t.env.broker.queue(QUEUES.mail).messages;

test("[SWHM2-C-0144] submitted order sends async XML, empties the cart, returns email and id", async () => {
  const t = makeEnv();
  const result = await submitPurchaseOrder(t.env, {
    orderId: "42",
    billingEmail: "buyer@example.com",
    items: ["FI-SW-01"],
  });
  const msgs = t.env.broker.queue(QUEUES.orders).messages;
  expect(msgs).toHaveLength(1);
  expect(msgs[0]).toMatch(/^\s*</);
  expect(msgs[0]).toContain("42");
  expect(t.env.cart).toHaveLength(0);
  expect(result).toEqual({ billingEmail: "buyer@example.com", orderId: "42" });
});

test("[SWHM2-C-0145] issued invoice is published to the invoice topic", async () => {
  const t = makeEnv();
  const invoice = "<Invoice><OrderId>42</OrderId></Invoice>";
  await issueInvoice(t.env, invoice);
  expect(t.env.broker.topic(INVOICE_TOPIC).published).toEqual([invoice]);
  expect(mailQueue(t)).toEqual([]); // invoice switch is off
});

test("a shipped mail is queued when the invoice switch is on and the order is known", async () => {
  const t = makeEnv();
  t.env.switches.invoice = true;
  await issueInvoice(t.env, "<Invoice><OrderId>42</OrderId></Invoice>");
  expect(parseMailDocument(mailQueue(t)[0]).subject).toBe("Java Pet Store Order Shipped: 42");
  await issueInvoice(t.env, "<Invoice><OrderId>999</OrderId></Invoice>");
  expect(mailQueue(t)).toHaveLength(1);
});

test("[SWHM2-C-0153] completing invoice sends the order id to the mail queue", async () => {
  const t = makeEnv();
  await processInvoice(t.env, { orderId: "42", completesOrder: true });
  expect(t.env.broker.queue(QUEUES.completedMail).messages).toEqual(["42"]);
});

test("[SWHM2-C-0154] partial shipment sends no completed-order message", async () => {
  const t = makeEnv();
  await processInvoice(t.env, { orderId: "42", completesOrder: false });
  expect(t.env.broker.queue(QUEUES.completedMail).messages).toEqual([]);
});

test("completed-order mail follows its switch", async () => {
  const t = makeEnv();
  await sendCompletedOrderMail(t.env, "42");
  expect(mailQueue(t)).toEqual([]);
  t.env.switches.completed = true;
  await sendCompletedOrderMail(t.env, "42");
  expect(parseMailDocument(mailQueue(t)[0]).subject).toBe("Java Pet Store Order COMPLETED: 42");
});

test("[SWHM2-C-0155] default switches send no e-mail", async () => {
  const t = makeEnv();
  expect(t.env.switches).toEqual({ statusChange: false, invoice: false, completed: false });
  await changeOrderStatus(t.env, "42", "SHIPPED");
  expect(t.sent).toHaveLength(0);
  expect(mailQueue(t)).toHaveLength(0);
});

test("[SWHM2-C-0156] status change e-mail has subject, stored address and locale", async () => {
  const t = makeEnv();
  t.env.switches.statusChange = true;
  await changeOrderStatus(t.env, "42", "SHIPPED");
  expect(mailQueue(t)).toHaveLength(1);
  const doc = parseMailDocument(mailQueue(t)[0]);
  expect(doc.subject).toBe("Java Pet Store Order Status: 42");
  expect(doc.address).toBe("buyer@example.com");
  await processMailMessage(t.env, mailQueue(t)[0]);
  expect(t.sent[0].to).toEqual(["buyer@example.com"]);
  expect(t.sent[0].locale).toBe("fr_FR");
  await changeOrderStatus(t.env, "999", "SHIPPED");
  expect(mailQueue(t)).toHaveLength(1); // unknown order
});

test("[SWHM2-C-0160] disabled notifications send no status e-mail", async () => {
  const t = makeEnv();
  t.env.switches.statusChange = false;
  await changeOrderStatus(t.env, "42", "APPROVED");
  expect(mailQueue(t)).toHaveLength(0);
  expect(t.sent).toHaveLength(0);
});

test("an undeliverable mail leaves the order flow unaffected", async () => {
  const t = makeEnv();
  t.transport.unreachable = true;
  await processMailMessage(
    t.env,
    "<Mail><Address>a</Address><Subject>s</Subject><Content>c</Content></Mail>",
  );
  await expect(
    submitPurchaseOrder(t.env, { orderId: "7", billingEmail: "b@x.com", items: [] }),
  ).resolves.toEqual({ billingEmail: "b@x.com", orderId: "7" });
  expect(NOW).toBeInstanceOf(Date);
});
