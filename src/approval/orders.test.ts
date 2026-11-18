/** @jest-environment node */
import { ORDER_STATUSES, getOrderStatus, recordOrderStatus } from "./orders";
import { makeEnv, type TestEnv } from "./__tests__/helpers";

let t: TestEnv;
beforeEach(async () => {
  t = await makeEnv();
});

test("[SWHM2-C-0021] order status is restricted to four values", async () => {
  expect([...ORDER_STATUSES].sort()).toEqual(["APPROVED", "COMPLETED", "DENIED", "PENDING"]);
  let id = 100;
  for (const s of ORDER_STATUSES) {
    id += 1;
    await recordOrderStatus(t.env, String(id), s);
    expect(await getOrderStatus(t.env, String(id))).toBe(s);
  }
  await expect(recordOrderStatus(t.env, "200", "SHIPPED")).rejects.toThrow();
  expect(await getOrderStatus(t.env, "200")).toBeUndefined();
});

test("recordOrderStatus changes an existing order and keeps one status", async () => {
  await recordOrderStatus(t.env, "7", "PENDING");
  await recordOrderStatus(t.env, "7", "APPROVED");
  expect(await getOrderStatus(t.env, "7")).toBe("APPROVED");
});
