import type { OrderStatus } from "./orders";

// The OrderApproval document (design.md P8): flat elements, no XML dependency.
export type ApprovalEntry = { orderId: string; status: string };

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
export const escapeXml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const decode = (s: string) => s.replace(/&(amp|lt|gt|quot|apos);/g, (_m, e: string) => ENTITIES[e]);

export function buildApprovalXml(entries: { orderId: string | number; status: OrderStatus }[]) {
  const orders = entries
    .map(
      (e) =>
        `<Order><OrderId>${escapeXml(String(e.orderId))}</OrderId><OrderStatus>${e.status}</OrderStatus></Order>`,
    )
    .join("");
  return `<OrderApproval>${orders}</OrderApproval>`;
}

/** The `<Order>` entries of an approval message, in document order. */
export function parseApprovalXml(xml: string): ApprovalEntry[] {
  const out: ApprovalEntry[] = [];
  for (const m of xml.matchAll(/<Order>([\s\S]*?)<\/Order>/g)) {
    const id = /<OrderId>([\s\S]*?)<\/OrderId>/.exec(m[1]);
    const status = /<OrderStatus>([\s\S]*?)<\/OrderStatus>/.exec(m[1]);
    if (id && status) out.push({ orderId: decode(id[1].trim()), status: decode(status[1].trim()) });
  }
  return out;
}
