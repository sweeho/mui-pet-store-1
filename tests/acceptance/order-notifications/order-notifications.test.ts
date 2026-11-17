/** @jest-environment node */
import { createBroker } from "@/notifications/broker";
import { sendMessage } from "@/notifications/sender";
import { buildMailDocument, parseMailDocument } from "@/notifications/mail-document";
import { buildOrderApproval, parseOrderApproval } from "@/notifications/order-approval";
import { processMailMessage } from "@/notifications/mailer";
import { createLocator, LocatorError } from "@/notifications/locator";
import {
  changeOrderStatus,
  issueInvoice,
  processInvoice,
  submitPurchaseOrder,
} from "@/notifications/order-flow";
import { INVOICE_TOPIC, QUEUES, makeEnv, mailXml, NOW } from "./harness";

describe("order-notifications", () => {
  // case: SWHM2-C-0144@v1
  it("SWHM2-C-0144 submitted order sends async XML, empties cart, returns email and id", async () => {
    const t = makeEnv();
    const result = await submitPurchaseOrder(t.env, {
      orderId: "42",
      billingEmail: "buyer@example.com",
      items: ["FI-SW-01"],
    });
    const msgs = t.env.broker.queue(QUEUES.orders).messages;
    expect(msgs).toHaveLength(1);
    expect(msgs[0]).toMatch(/^\s*<\?xml|^\s*</);
    expect(msgs[0]).toContain("42");
    expect(t.env.cart).toHaveLength(0);
    expect(result).toEqual({ billingEmail: "buyer@example.com", orderId: "42" });
  });

  // case: SWHM2-C-0145@v1
  it("SWHM2-C-0145 issued invoice is published to the invoice topic", async () => {
    const t = makeEnv();
    const invoice = "<Invoice><OrderId>42</OrderId></Invoice>";
    await issueInvoice(t.env, invoice);
    expect(t.env.broker.topic(INVOICE_TOPIC).published).toEqual([invoice]);
  });

  // case: SWHM2-C-0146@v1
  it("SWHM2-C-0146 mail to two recipients carries default headers", async () => {
    const t = makeEnv();
    await processMailMessage(t.env, mailXml("a@x.com, b@y.com", "Hello", "<p>Body</p>"));
    expect(t.sent).toHaveLength(1);
    const m = t.sent[0];
    expect(m.to).toEqual(["a@x.com", "b@y.com"]);
    expect(m.from).toBe(t.env.defaultSender);
    expect(m.subject).toBe("Hello");
    expect(m.html).toContain("Body");
    expect(m.sentDate).toEqual(NOW);
    expect(m.headers["X-Mailer"]).toBe("JavaMailer");
  });

  // case: SWHM2-C-0147@v1
  it("SWHM2-C-0147 wrong document type is rejected by the OrderApproval parser", () => {
    expect(() =>
      parseOrderApproval("<Mail><Address>a</Address></Mail>", { validate: true }),
    ).toThrow();
    const ok = buildOrderApproval([{ orderId: "1", approved: true }]);
    expect(() => parseOrderApproval(ok, { validate: true })).not.toThrow();
  });

  // case: SWHM2-C-0148@v1
  it("SWHM2-C-0148 malformed mail request raises an error", async () => {
    const t = makeEnv();
    await expect(processMailMessage(t.env, "this is not a mail document")).rejects.toThrow();
    await expect(processMailMessage(t.env, "<Other><x/></Other>")).rejects.toThrow();
    expect(t.sent).toHaveLength(0);
  });

  // case: SWHM2-C-0149@v1
  it("SWHM2-C-0149 approval outcomes produce one document with one entry per order", () => {
    const xml = buildOrderApproval([
      { orderId: "1", approved: true },
      { orderId: "2", approved: false },
      { orderId: "3", approved: true },
    ]);
    expect(xml.match(/<OrderApproval[\s>]/g)).toHaveLength(1);
    expect(xml.match(/<Order[\s>]/g)).toHaveLength(3);
    for (const id of ["1", "2", "3"]) expect(xml).toContain(id);
  });

  // case: SWHM2-C-0150@v1
  it("SWHM2-C-0150 repeated queue lookup uses the cache", async () => {
    const queue = { name: "q" };
    const lookup = jest.fn(async () => queue);
    const locator = createLocator(lookup);
    const first = await locator.get("jms/Queue");
    const second = await locator.get("jms/Queue");
    expect(second).toBe(first);
    expect(lookup).toHaveBeenCalledTimes(1);
  });

  // case: SWHM2-C-0151@v1
  it("SWHM2-C-0151 message is not delivered when the transaction rolls back", async () => {
    const t = makeEnv();
    const tx = t.env.broker.begin();
    await sendMessage(t.env, QUEUES.asyncSender, "hello", tx);
    await tx.rollback();
    expect(t.env.broker.queue(QUEUES.asyncSender).messages).toEqual([]);

    const tx2 = t.env.broker.begin();
    await sendMessage(t.env, QUEUES.asyncSender, "kept", tx2);
    await tx2.commit();
    expect(t.env.broker.queue(QUEUES.asyncSender).messages).toEqual(["kept"]);
  });

  // case: SWHM2-C-0152@v1
  it("SWHM2-C-0152 sender places one text message on the queue", async () => {
    const t = makeEnv();
    await sendMessage(t.env, QUEUES.asyncSender, "payload");
    expect(t.env.broker.queue(QUEUES.asyncSender).messages).toEqual(["payload"]);
  });

  // case: SWHM2-C-0153@v1
  it("SWHM2-C-0153 completing invoice sends the order id to the mail queue", async () => {
    const t = makeEnv();
    await processInvoice(t.env, { orderId: "42", completesOrder: true });
    expect(t.env.broker.queue(QUEUES.completedMail).messages).toEqual(["42"]);
  });

  // case: SWHM2-C-0154@v1
  it("SWHM2-C-0154 partial shipment sends no completed-order message", async () => {
    const t = makeEnv();
    await processInvoice(t.env, { orderId: "42", completesOrder: false });
    expect(t.env.broker.queue(QUEUES.completedMail).messages).toEqual([]);
  });

  // case: SWHM2-C-0155@v1
  it("SWHM2-C-0155 default switches send no e-mail", async () => {
    const t = makeEnv();
    expect(t.env.switches).toEqual({ statusChange: false, invoice: false, completed: false });
    await changeOrderStatus(t.env, "42", "SHIPPED");
    expect(t.sent).toHaveLength(0);
    expect(t.env.broker.queue(QUEUES.mail).messages).toHaveLength(0);
  });

  // case: SWHM2-C-0156@v1
  it("SWHM2-C-0156 status change e-mail has subject, stored address and locale", async () => {
    const t = makeEnv();
    t.env.switches.statusChange = true;
    await changeOrderStatus(t.env, "42", "SHIPPED");
    const queued = t.env.broker.queue(QUEUES.mail).messages;
    expect(queued).toHaveLength(1);
    // Locale travels with the mail; the mailer delivers it.
    const doc = parseMailDocument(queued[0]);
    expect(doc.subject).toBe("Java Pet Store Order Status: 42");
    expect(doc.address).toBe("buyer@example.com");
    await processMailMessage(t.env, queued[0]);
    expect(t.sent).toHaveLength(1);
    expect(t.sent[0].to).toEqual(["buyer@example.com"]);
    expect(t.sent[0].subject).toBe("Java Pet Store Order Status: 42");
    expect(t.sent[0].locale).toBe("fr_FR");
  });

  // case: SWHM2-C-0157@v1
  it("SWHM2-C-0157 mail request with wrong structure is rejected", () => {
    const outOfOrder = "<Mail><Subject>s</Subject><Address>a</Address><Content>c</Content></Mail>";
    const missing = "<Mail><Address>a</Address><Subject>s</Subject></Mail>";
    expect(() => parseMailDocument(outOfOrder)).toThrow();
    expect(() => parseMailDocument(missing)).toThrow();
  });

  // case: SWHM2-C-0158@v1
  it("SWHM2-C-0158 unreachable mail server discards the request without retry", async () => {
    const t = makeEnv();
    t.transport.unreachable = true;
    await expect(
      processMailMessage(t.env, mailXml("a@x.com", "Hi", "body")),
    ).resolves.not.toThrow();
    expect(t.attempts.count).toBe(1);
    expect(t.sent).toHaveLength(0);
    expect(t.logs.length).toBeGreaterThan(0);
    // The order flow is unaffected.
    await expect(
      submitPurchaseOrder(t.env, { orderId: "7", billingEmail: "b@x.com", items: [] }),
    ).resolves.toEqual({ billingEmail: "b@x.com", orderId: "7" });
  });

  // case: SWHM2-C-0159@v1
  it("SWHM2-C-0159 unresolvable name raises a locator error wrapping the cause", async () => {
    const cause = new Error("name not found");
    const locator = createLocator(async () => {
      throw cause;
    });
    const err = await locator.get("jms/Missing").catch((e: unknown) => e);
    expect(err).toBeInstanceOf(LocatorError);
    expect((err as LocatorError).cause).toBe(cause);
  });

  // case: SWHM2-C-0160@v1
  it("SWHM2-C-0160 disabled notifications send no status e-mail", async () => {
    const t = makeEnv();
    t.env.switches.statusChange = false;
    await changeOrderStatus(t.env, "42", "APPROVED");
    expect(t.env.broker.queue(QUEUES.mail).messages).toHaveLength(0);
    expect(t.sent).toHaveLength(0);
  });

  // case: SWHM2-C-0161@v1
  it("SWHM2-C-0161 mail document carries Address, Subject and Content as text", () => {
    const xml = buildMailDocument({ address: "a@x.com", subject: "Subj", content: "Body" });
    expect(xml).toMatch(/<Address>a@x\.com<\/Address>/);
    expect(xml).toMatch(/<Subject>Subj<\/Subject>/);
    expect(xml).toMatch(/<Content>Body<\/Content>/);
    expect(parseMailDocument(xml)).toEqual({
      address: "a@x.com",
      subject: "Subj",
      content: "Body",
    });
  });
});
