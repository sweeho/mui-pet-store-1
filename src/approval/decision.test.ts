/** @jest-environment node */
import { forwardDecision } from "./decision";
import { makeEnv, type TestEnv } from "./__tests__/helpers";

let t: TestEnv;
beforeEach(async () => {
  t = await makeEnv();
});

test("[SWHM2-C-0022] an auto-approved order puts a message on the approval queue", async () => {
  expect(t.approvalQueue).toHaveLength(0);
  await forwardDecision(t.env, "301", "APPROVED");
  expect(t.approvalQueue).toHaveLength(1);
  expect(t.approvalQueue[0]).toContain("OrderApproval");
  expect(t.approvalQueue[0]).toContain("301");
  expect(t.approvalQueue[0]).toContain("APPROVED");
});
