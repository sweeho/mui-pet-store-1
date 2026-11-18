import { sql } from "drizzle-orm";

import { hasAdminSession, unauthorized } from "@/admin/session";
import { getDb } from "@/db/client";

/** GET /api/admin/orders/{id}: one order as the approval screen shows it, or 404. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  if (!(await hasAdminSession(request))) return unauthorized();
  const { id } = await params;
  const rows = (await (
    await getDb()
  ).all(
    sql`SELECT order_id, user_name, order_time, locale, total_price, status
        FROM purchase_order WHERE order_id = ${id}`,
  )) as {
    order_id: string | number;
    user_name: string;
    order_time: number | bigint;
    locale: string;
    total_price: number;
    status: string;
  }[];
  const r = rows[0];
  if (!r) return Response.json({ error: "order not found" }, { status: 404 });
  return Response.json({
    orderId: String(r.order_id),
    userName: r.user_name,
    orderTime: Number(r.order_time),
    locale: r.locale,
    total: r.total_price,
    status: r.status,
  });
}
