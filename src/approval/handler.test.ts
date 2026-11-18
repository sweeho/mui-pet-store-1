/** @jest-environment node */
import { processApprovalMessage } from "./handler";
import { getOrderStatus } from "./orders";
import { approvalXml, makeEnv, seedOrder, type TestEnv } from "./helpers.test";

let t: TestEnv;
beforeEach(async () => {
  t = await makeEnv();
});

test("[SWHM2-C-0025] an approval message approves the order and sends a supplier PO with both lines", async () => {
  await seedOrder(t.env, 304, "PENDING", 2);
  await processApprovalMessage(t.env, approvalXml([[304, "APPROVED"]]));
  expect(await getOrderStatus(t.env, "304")).toBe("APPROVED");
  expect(t.supplierQueue).toHaveLength(1);
  expect(t.supplierQueue[0]).toContain("304");
  expect(t.supplierQueue[0].match(/<LineItem>/g)).toHaveLength(2);
  expect(t.supplierQueue[0]).toContain("EST-1");
  expect(t.supplierQueue[0]).toContain("EST-2");
});

test("[SWHM2-C-0026] a denial message denies the order and sends no supplier PO", async () => {
  await seedOrder(t.env, 305, "PENDING");
  await processApprovalMessage(t.env, approvalXml([[305, "DENIED"]]));
  expect(await getOrderStatus(t.env, "305")).toBe("DENIED");
  expect(t.supplierQueue).toHaveLength(0);
});

test("[SWHM2-C-0031] a denial message for an APPROVED order is ignored", async () => {
  await seedOrder(t.env, 307, "APPROVED");
  await processApprovalMessage(t.env, approvalXml([[307, "DENIED"]]));
  expect(await getOrderStatus(t.env, "307")).toBe("APPROVED");
  expect(t.supplierQueue).toHaveLength(0);
  expect(t.notifyList).toHaveLength(0);
});

test("[SWHM2-C-0032] a processed PENDING order is updated and queued for notification", async () => {
  await seedOrder(t.env, 308, "PENDING");
  expect(t.notifyList).toHaveLength(0);
  await processApprovalMessage(t.env, approvalXml([[308, "DENIED"]]));
  expect(await getOrderStatus(t.env, "308")).toBe("DENIED");
  expect(t.notifyList.map(String)).toEqual(["308"]);
});

test("[SWHM2-C-0036] an approve change for a COMPLETED order is ignored", async () => {
  await seedOrder(t.env, 310, "COMPLETED");
  await processApprovalMessage(t.env, approvalXml([[310, "APPROVED"]]));
  expect(await getOrderStatus(t.env, "310")).toBe("COMPLETED");
  expect(t.supplierQueue).toHaveLength(0);
  expect(t.notifyList).toHaveLength(0);
});
