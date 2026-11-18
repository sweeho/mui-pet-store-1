import { loadSession, SESSION_COOKIE } from "@/accounts/web-session";
import { getOrder } from "@/checkout/store";
import { ANONYMOUS } from "@/checkout/submit";
import { getDb } from "@/db/client";

import { parseCookies } from "../../../accounts/redirects";

/**
 * GET /api/checkout/orders/{id}: the order with its placeholder `paymentCard` and lines, only for
 * the user who placed it ("anonymous" without a session); never the card the customer entered.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  const db = await getDb();
  const sessionId = parseCookies(request.headers.get("cookie"))[SESSION_COOKIE];
  const session = sessionId ? await loadSession(db, sessionId, Date.now()) : null;
  const order = await getOrder(db, id);
  if (!order || order.userId !== (session?.signedOn ? session.username : ANONYMOUS)) {
    return Response.json({ error: "order not found" }, { status: 404 });
  }
  return Response.json(order);
}
