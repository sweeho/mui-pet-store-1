/** @jest-environment node */
import { sql } from "drizzle-orm";

import { getOrderStatus } from "./orders";
import { receivePurchaseOrder } from "./receive";
import { makeEnv, po, type TestEnv } from "./helpers.test-util";

let t: TestEnv;
beforeEach(async () => {
  t = await makeEnv();
});

test("[SWHM2-C-0023] a qualifying purchase order is stored PENDING and an APPROVED approval is published", async () => {
  await receivePurchaseOrder(t.env, po(302, "en_US", 100));
  expect(await getOrderStatus(t.env, "302")).toBe("PENDING");
  expect(t.approvalQueue).toHaveLength(1);
  expect(t.approvalQueue[0]).toContain("302");
  expect(t.approvalQueue[0]).toContain("APPROVED");
  const lines = await t.env.db.all(sql`SELECT item_id FROM order_line WHERE order_id = '302'`);
  expect(lines).toHaveLength(1);
  const rows = await t.env.db.all(sql`SELECT status FROM purchase_order WHERE order_id = '302'`);
  expect(rows).toHaveLength(1);
});

test("[SWHM2-C-0024] a non-qualifying purchase order is stored PENDING and nothing is published", async () => {
  await receivePurchaseOrder(t.env, po(303, "en_US", 5000));
  expect(await getOrderStatus(t.env, "303")).toBe("PENDING");
  expect(t.approvalQueue).toHaveLength(0);
});

test("[SWHM2-C-0030] a Japan order with total 50000 is held PENDING", async () => {
  await receivePurchaseOrder(t.env, po(306, "ja_JP", 50000));
  expect(await getOrderStatus(t.env, "306")).toBe("PENDING");
  expect(t.approvalQueue).toHaveLength(0);
});

test("[SWHM2-C-0035] an order from another locale stays PENDING", async () => {
  await receivePurchaseOrder(t.env, po(309, "fr_FR", 10));
  expect(await getOrderStatus(t.env, "309")).toBe("PENDING");
  expect(t.approvalQueue).toHaveLength(0);
});
