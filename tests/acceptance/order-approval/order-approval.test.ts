/** @jest-environment node */
import { ORDER_STATUSES, getOrderStatus, recordOrderStatus } from "@/approval/orders";
import { canApprove } from "@/approval/policy";
import { receivePurchaseOrder } from "@/approval/receive";
import { forwardDecision } from "@/approval/decision";
import { processApprovalMessage } from "@/approval/handler";
import { approvalXml, makeEnv, po, rejects, resetData, seedOrder, type TestEnv } from "./harness";

let t: TestEnv;

beforeEach(async () => {
  t = await makeEnv();
  await resetData(t.db);
});

// case: SWHM2-C-0021@v1
test("SWHM2-C-0021 order status is restricted to four values", async () => {
  expect([...ORDER_STATUSES].sort()).toEqual(["APPROVED", "COMPLETED", "DENIED", "PENDING"]);
  let id = 100;
  for (const s of ["PENDING", "APPROVED", "DENIED", "COMPLETED"]) {
    id += 1;
    await recordOrderStatus(t.env, String(id), s);
    expect(await getOrderStatus(t.env, String(id))).toBe(s);
  }
  expect(await rejects(recordOrderStatus(t.env, "200", "SHIPPED"))).toBe(true);
  expect(await getOrderStatus(t.env, "200")).toBeUndefined();
});

// case: SWHM2-C-0022@v1
test("SWHM2-C-0022 auto-approved order puts a message on the approval queue", async () => {
  expect(t.approvalQueue).toHaveLength(0);
  await forwardDecision(t.env, "301", "APPROVED");
  expect(t.approvalQueue).toHaveLength(1);
  expect(t.approvalQueue[0]).toContain("OrderApproval");
  expect(t.approvalQueue[0]).toContain("301");
});

// case: SWHM2-C-0023@v1
test("SWHM2-C-0023 qualifying purchase order is stored PENDING and an APPROVED approval is published", async () => {
  await receivePurchaseOrder(t.env, po(302, "en_US", 100));
  expect(await getOrderStatus(t.env, "302")).toBe("PENDING");
  expect(t.approvalQueue).toHaveLength(1);
  expect(t.approvalQueue[0]).toContain("302");
  expect(t.approvalQueue[0]).toContain("APPROVED");
});

// case: SWHM2-C-0024@v1
test("SWHM2-C-0024 non-qualifying purchase order is stored PENDING and nothing is published", async () => {
  await receivePurchaseOrder(t.env, po(303, "en_US", 5000));
  expect(await getOrderStatus(t.env, "303")).toBe("PENDING");
  expect(t.approvalQueue).toHaveLength(0);
});

// case: SWHM2-C-0025@v1
test("SWHM2-C-0025 approval message approves the order and sends a supplier PO with both lines", async () => {
  await seedOrder(t.db, 304, "PENDING", 2);
  await processApprovalMessage(t.env, approvalXml([[304, "APPROVED"]]));
  expect(await getOrderStatus(t.env, "304")).toBe("APPROVED");
  expect(t.supplierQueue).toHaveLength(1);
  expect(t.supplierQueue[0]).toContain("304");
  expect(t.supplierQueue[0].match(/<LineItem>/g)).toHaveLength(2);
  expect(t.supplierQueue[0]).toContain("EST-1");
  expect(t.supplierQueue[0]).toContain("EST-2");
});

// case: SWHM2-C-0026@v1
test("SWHM2-C-0026 denial message denies the order and sends no supplier PO", async () => {
  await seedOrder(t.db, 305, "PENDING");
  await processApprovalMessage(t.env, approvalXml([[305, "DENIED"]]));
  expect(await getOrderStatus(t.env, "305")).toBe("DENIED");
  expect(t.supplierQueue).toHaveLength(0);
});

// case: SWHM2-C-0030@v1
test("SWHM2-C-0030 Japan order with total 50000 is held PENDING", async () => {
  await receivePurchaseOrder(t.env, po(306, "ja_JP", 50000));
  expect(await getOrderStatus(t.env, "306")).toBe("PENDING");
  expect(t.approvalQueue).toHaveLength(0);
});

// case: SWHM2-C-0031@v1
test("SWHM2-C-0031 denial message for an APPROVED order is ignored", async () => {
  await seedOrder(t.db, 307, "APPROVED");
  await processApprovalMessage(t.env, approvalXml([[307, "DENIED"]]));
  expect(await getOrderStatus(t.env, "307")).toBe("APPROVED");
  expect(t.supplierQueue).toHaveLength(0);
  expect(t.notifyList).toHaveLength(0);
});

// case: SWHM2-C-0032@v1
test("SWHM2-C-0032 processed PENDING order is updated and queued for notification", async () => {
  await seedOrder(t.db, 308, "PENDING");
  expect(t.notifyList).toHaveLength(0);
  await processApprovalMessage(t.env, approvalXml([[308, "DENIED"]]));
  expect(await getOrderStatus(t.env, "308")).toBe("DENIED");
  expect(t.notifyList.map(String)).toEqual(["308"]);
});

// case: SWHM2-C-0033@v1
test("SWHM2-C-0033 US order of 499 is auto-approved", () => {
  expect(canApprove({ locale: "en_US", total: 499 })).toBe(true);
});

// case: SWHM2-C-0034@v1
test("SWHM2-C-0034 US order of 500 is not auto-approved", () => {
  expect(canApprove({ locale: "en_US", total: 500 })).toBe(false);
});

// case: SWHM2-C-0035@v1
test("SWHM2-C-0035 order from another locale stays PENDING", async () => {
  await receivePurchaseOrder(t.env, po(309, "fr_FR", 10));
  expect(await getOrderStatus(t.env, "309")).toBe("PENDING");
  expect(t.approvalQueue).toHaveLength(0);
});

// case: SWHM2-C-0036@v1
test("SWHM2-C-0036 approve change for a COMPLETED order is ignored", async () => {
  await seedOrder(t.db, 310, "COMPLETED");
  await processApprovalMessage(t.env, approvalXml([[310, "APPROVED"]]));
  expect(await getOrderStatus(t.env, "310")).toBe("COMPLETED");
  expect(t.supplierQueue).toHaveLength(0);
  expect(t.notifyList).toHaveLength(0);
});
