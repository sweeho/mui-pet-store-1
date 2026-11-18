/** @jest-environment node */
import { createBroker } from "./broker";
import { sendMessage } from "./sender";
import { INVOICE_TOPIC, QUEUES, makeEnv } from "../../tests/acceptance/order-notifications/harness";

test("[SWHM2-C-0151] message is not delivered when the transaction rolls back", async () => {
  const t = makeEnv();
  const tx = t.env.broker.begin();
  await sendMessage(t.env, QUEUES.asyncSender, "hello", tx);
  expect(t.env.broker.queue(QUEUES.asyncSender).messages).toEqual([]);
  await tx.rollback();
  expect(t.env.broker.queue(QUEUES.asyncSender).messages).toEqual([]);
  const tx2 = t.env.broker.begin();
  await sendMessage(t.env, QUEUES.asyncSender, "kept", tx2);
  await tx2.commit();
  expect(t.env.broker.queue(QUEUES.asyncSender).messages).toEqual(["kept"]);
});

test("[SWHM2-C-0152] sender places one text message on the queue", async () => {
  const t = makeEnv();
  await sendMessage(t.env, QUEUES.asyncSender, "payload");
  expect(t.env.broker.queue(QUEUES.asyncSender).messages).toEqual(["payload"]);
});

test("brokers are independent and topics are separate from queues", () => {
  const a = createBroker();
  const b = createBroker();
  a.queue("q").messages.push("x");
  expect(b.queue("q").messages).toEqual([]);
  expect(a.topic(INVOICE_TOPIC).published).toEqual([]);
});
