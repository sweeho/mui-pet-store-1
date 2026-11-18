import { hasAdminSession, unauthorized } from "@/admin/session";
import { forwardDecision } from "@/approval/decision";
import { dispatchApprovals } from "@/approval/dispatch";
import { newEnv } from "@/approval/env";
import { getOrderStatus } from "@/approval/orders";
import { getDb } from "@/db/client";

type Decision = { orderId: string; status: "APPROVED" | "DENIED" };

function parseDecisions(body: unknown): Decision[] | null {
  const list = (body as { decisions?: unknown } | null)?.decisions;
  if (!Array.isArray(list)) return null;
  const out: Decision[] = [];
  for (const d of list as { orderId?: unknown; status?: unknown }[]) {
    if (typeof d?.orderId !== "string" || (d.status !== "APPROVED" && d.status !== "DENIED")) {
      return null;
    }
    out.push({ orderId: d.orderId, status: d.status });
  }
  return out;
}

/**
 * POST /api/admin/approvals (design.md P6): Commit. One order-approval message per decision,
 * dispatched at once; orders that are no longer PENDING are ignored by the handler.
 */
export async function POST(request: Request): Promise<Response> {
  if (!(await hasAdminSession(request))) return unauthorized();
  const decisions = parseDecisions(await request.json().catch(() => null));
  if (!decisions) return Response.json({ error: "decisions must be a list" }, { status: 400 });
  const env = newEnv(await getDb(), "admin");
  // The summary lists only the orders that are PENDING now, once each: the handler ignores the rest.
  const changing = new Map<string, Decision["status"]>();
  for (const d of decisions) {
    if (!changing.has(d.orderId) && (await getOrderStatus(env, d.orderId)) === "PENDING") {
      changing.set(d.orderId, d.status);
    }
  }
  for (const d of decisions) await forwardDecision(env, d.orderId, d.status);
  await dispatchApprovals(env);
  const listed = (status: Decision["status"]) =>
    [...changing].filter(([, s]) => s === status).map(([id]) => id);
  return Response.json({
    sent: decisions.length,
    approved: listed("APPROVED"),
    denied: listed("DENIED"),
  });
}
