import type { ApprovalEnv } from "./env";
import { buildApprovalXml } from "./documents";

/** Put one order-approval message for the order on the approval queue. */
export async function forwardDecision(
  env: ApprovalEnv,
  orderId: string | number,
  status: "APPROVED" | "DENIED",
): Promise<void> {
  env.approvalQueue.push(buildApprovalXml([{ orderId, status }]));
}
