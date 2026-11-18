/** @jest-environment node */
import { sql } from "drizzle-orm";

import { getDb } from "@/db/client";
import { notifyOrders } from "./runtime";

const KEYS = ["NOTIFY_STATUS_CHANGE", "NOTIFY_INVOICE", "NOTIFY_COMPLETED"];
afterEach(() => {
  for (const k of KEYS) delete process.env[k];
  jest.restoreAllMocks();
});

test("with every switch off nothing is logged and nothing throws", async () => {
  const err = jest.spyOn(console, "error").mockImplementation(() => undefined);
  const db = await getDb();
  await expect(notifyOrders(db, { statuses: ["1"], completed: ["1"] })).resolves.toBeUndefined();
  expect(err).not.toHaveBeenCalled();
});

test("with a switch on and the default transport the mail is logged and dropped", async () => {
  const err = jest.spyOn(console, "error").mockImplementation(() => undefined);
  process.env.NOTIFY_STATUS_CHANGE = "true";
  const db = await getDb();
  const id = "9" + Date.now();
  await db.run(
    sql`INSERT INTO checkout_order (order_id, user_id, email_address, order_date, locale, total_price, ship_to, bill_to, card_number, card_type, expiry_date)
        VALUES (${id}, 'u', 'b@x.com', 0, 'en_US', 1, 's', 'b', '1', 'V', '01/30')`,
  );
  try {
    await expect(notifyOrders(db, { statuses: [id] })).resolves.toBeUndefined();
    expect(err).toHaveBeenCalledWith(expect.stringContaining("no mail server configured"));
  } finally {
    await db.run(sql`DELETE FROM checkout_order WHERE order_id = ${id}`);
  }
});

test("a failing database never throws into the caller", async () => {
  jest.spyOn(console, "error").mockImplementation(() => undefined);
  process.env.NOTIFY_STATUS_CHANGE = "true";
  await expect(notifyOrders({} as never, { statuses: ["1"] })).resolves.toBeUndefined();
});
