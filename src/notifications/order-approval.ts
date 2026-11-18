import { buildApprovalXml, parseApprovalXml } from "@/approval/documents";
import { parseDocument } from "@/fulfilment/documents";

/** One `<OrderApproval>` document with an `<Order>` entry per outcome (design.md P5, SD5). */
export function buildOrderApproval(entries: { orderId: string; approved: boolean }[]): string {
  return buildApprovalXml(
    entries.map((e) => ({ orderId: e.orderId, status: e.approved ? "APPROVED" : "DENIED" })),
  );
}

export function parseOrderApproval(
  xml: string,
  options: { validate: boolean },
): { orderId: string; approved: boolean }[] {
  const root = parseDocument(xml, options);
  if (options.validate && root !== "OrderApproval") {
    throw new Error(`expected an OrderApproval document, got ${root}`);
  }
  return parseApprovalXml(xml).map((e) => ({
    orderId: e.orderId,
    approved: e.status === "APPROVED",
  }));
}
