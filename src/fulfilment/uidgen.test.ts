/** @jest-environment node */
import { useIsolatedDatabase } from "@/db/isolated";
import { nextId } from "./uidgen";

import { makeEnv, resetData, type TestEnv } from "../../tests/acceptance/order-fulfilment/harness";

let t: TestEnv;

beforeAll(async () => {
  await useIsolatedDatabase();
});

beforeEach(async () => {
  t = await makeEnv();
  await resetData(t.db);
});

describe("identifiers", () => {
  it("[SWHM2-C-0206] a counter creation failure raises an error", async () => {
    t.counterCreation.fail = true;
    await expect(nextId(t.env, "ORD")).rejects.toThrow();
  });

  it("[SWHM2-C-0207] identifier generation needs no role", async () => {
    expect(t.env.callerRole).toBeUndefined();
    const first = await nextId(t.env, "ORD");
    const second = await nextId(t.env, "ORD");
    expect(first).toBeTruthy();
    expect(second).not.toBe(first);
  });
});
