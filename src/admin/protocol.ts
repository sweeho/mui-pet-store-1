import { forwardDecision } from "@/approval/decision";
import { dispatchApprovals } from "@/approval/dispatch";
import { newEnv } from "@/approval/env";
import { getOrderStatus } from "@/approval/orders";
import { getDb } from "@/db/client";

import { escapeXml } from "./launch";
import { listOrdersByStatus } from "./orders";
import { salesReport } from "./reports";
import { hasAdminSession } from "./session";

export const SESSION_TIMEOUT_MESSAGE =
  "Session Timed Out; Please exit and login as admin from the login page";

const xml = (body: string, status = 200) =>
  new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<Response>${body}</Response>\n`, {
    status,
    headers: { "content-type": "application/xml; charset=utf-8" },
  });
const error = (message: string, status = 400) =>
  xml(`<Error>${escapeXml(message)}</Error>`, status);

const unescapeXml = (s: string): string =>
  s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");

/** The text of the first `<name>` in `source`, or "". The protocol's elements are flat. */
function child(source: string, name: string): string {
  const m = new RegExp(`<${name}>([^<]*)</${name}>`).exec(source);
  return m ? unescapeXml(m[1].trim()) : "";
}

const blocks = (source: string, name: string): string[] =>
  [...source.matchAll(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`, "g"))].map((m) => m[1]);

async function updateStatus(body: string): Promise<Response> {
  const env = newEnv(await getDb(), "admin");
  const decisions: { orderId: string; status: "APPROVED" | "DENIED" }[] = [];
  for (const order of blocks(body, "Order")) {
    const orderId = child(order, "OrderId");
    const status = child(order, "Status");
    if (!orderId || (status !== "APPROVED" && status !== "DENIED")) {
      return error("Each Order needs an OrderId and a Status of APPROVED or DENIED");
    }
    decisions.push({ orderId, status });
  }
  let sent = 0;
  const seen = new Set<string>();
  for (const d of decisions) {
    if (seen.has(d.orderId)) continue;
    seen.add(d.orderId);
    if ((await getOrderStatus(env, d.orderId)) !== "PENDING") continue;
    await forwardDecision(env, d.orderId, d.status);
    sent++;
  }
  await dispatchApprovals(env);
  return xml(`<Sent>${sent}</Sent>`);
}

/** The rich-client XML endpoint (design.md P8). Nothing runs without an administrator session. */
export async function handleApplRequest(request: Request): Promise<Response> {
  if (!(await hasAdminSession(request))) return error(SESSION_TIMEOUT_MESSAGE, 401);
  const body = await request.text();
  const type = child(body, "Type");
  const db = await getDb();
  switch (type) {
    case "GETORDERS": {
      const orders = await listOrdersByStatus(db, child(body, "Status"));
      const items = orders
        .map(
          (o) =>
            `<Order><OrderId>${escapeXml(String(o.orderId))}</OrderId><UserId>${escapeXml(o.userId)}</UserId>` +
            `<OrderDate>${escapeXml(o.date)}</OrderDate><OrderValue>${o.value}</OrderValue>` +
            `<OrderStatus>${escapeXml(o.status)}</OrderStatus></Order>`,
        )
        .join("");
      return xml(`<Orders>${items}<Count>${orders.length}</Count></Orders>`);
    }
    case "UPDATESTATUS":
      return updateStatus(body);
    case "REVENUE":
    case "ORDERS": {
      const result = await salesReport(db, {
        start: child(body, "Start"),
        end: child(body, "End"),
        type,
        category: child(body, "Category") || undefined,
      });
      if ("error" in result) return error(result.error);
      const rows = result.rows
        .map((r) => `<Row><Name>${escapeXml(r.name)}</Name><Value>${r.value}</Value></Row>`)
        .join("");
      return xml(`<Report>${rows}<Total>${result.total}</Total></Report>`);
    }
    default:
      return error(type ? `Unknown request type: ${type}` : "Missing request type");
  }
}
