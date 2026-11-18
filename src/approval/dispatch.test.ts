/** @jest-environment node */
import { sql } from "drizzle-orm";

import { forwardDecision } from "./decision";
import { dispatchApprovals } from "./dispatch";
import { getOrderStatus } from "./orders";
import { makeEnv, seedOrder, type TestEnv } from "./helpers.test";

let t: TestEnv;
beforeEach(async () => {
  t = await makeEnv();
  await t.env.db.run(sql`DELETE FROM message_outbox`);
  // No stock: this file is about approval; stock would ship the approved orders (fulfilment).
  await t.env.db.run(sql`DELETE FROM inventory`);
});

const outbox = async () =>
  (
    (await t.env.db.all(sql`SELECT queue, origin, order_id FROM message_outbox ORDER BY id`)) as {
      queue: string;
      origin: string;
      order_id: string | number;
    }[]
  ).map((r) => ({ ...r, order_id: String(r.order_id) }));

test("dispatch applies each queued decision and records every message", async () => {
  await seedOrder(t.env, 500, "PENDING");
  await seedOrder(t.env, 501, "PENDING");
  t.env.origin = "admin";
  await forwardDecision(t.env, "500", "APPROVED");
  await forwardDecision(t.env, "501", "DENIED");
  await dispatchApprovals(t.env);
  expect(await getOrderStatus(t.env, "500")).toBe("APPROVED");
  expect(await getOrderStatus(t.env, "501")).toBe("DENIED");
  expect(t.approvalQueue).toHaveLength(0);
  expect(await outbox()).toEqual([
    { queue: "order-approval", origin: "admin", order_id: "500" },
    { queue: "order-approval", origin: "admin", order_id: "501" },
    { queue: "supplier-purchase-order", origin: "admin", order_id: "500" },
    { queue: "customer-notification", origin: "admin", order_id: "500" },
    { queue: "customer-notification", origin: "admin", order_id: "501" },
  ]);
});

test("a message for a non-PENDING order is recorded but changes nothing", async () => {
  await seedOrder(t.env, 502, "APPROVED");
  await forwardDecision(t.env, "502", "DENIED");
  await dispatchApprovals(t.env);
  expect(await getOrderStatus(t.env, "502")).toBe("APPROVED");
  expect((await outbox()).map((o) => o.queue)).toEqual(["order-approval"]);
});

test("an approved order's supplier purchase order is handed to fulfilment and ships from stock", async () => {
  await seedOrder(t.env, 503, "PENDING", 1);
  await t.env.db.run(sql`INSERT INTO inventory (item_id, quantity) VALUES ('EST-1', 5)`);
  await forwardDecision(t.env, "503", "APPROVED");
  await dispatchApprovals(t.env);
  expect(await getOrderStatus(t.env, "503")).toBe("COMPLETED");
  expect((await outbox()).map((o) => o.queue)).toEqual([
    "order-approval",
    "supplier-purchase-order",
    "supplier-invoice",
    "completed-order",
    "customer-notification",
  ]);
});
