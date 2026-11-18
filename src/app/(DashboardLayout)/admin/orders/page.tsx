import { sql } from "drizzle-orm";

import { requireAdmin } from "@/admin/session";
import { ORDER_STATUSES } from "@/approval/orders";
import { OrderApprovalView, type ApprovalOrder } from "@/components/admin/OrderApprovalView";
import { getDb } from "@/db/client";

export const dynamic = "force-dynamic";

/** `/admin/orders`: every order, newest first; the tabs filter by `?status=` (design.md P6, SD2). */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const { status } = await searchParams;
  const filter = ORDER_STATUSES.find((s) => s === status) ?? "ALL";
  const rows = (await (
    await getDb()
  ).all(
    sql`SELECT order_id, user_name, order_time, total_price, status FROM purchase_order
        ORDER BY order_time DESC, rowid DESC`,
  )) as {
    order_id: string | number;
    user_name: string;
    order_time: number | bigint;
    total_price: number;
    status: string;
  }[];
  const all: ApprovalOrder[] = rows.map((r) => ({
    orderId: String(r.order_id),
    userName: r.user_name,
    orderTime: Number(r.order_time),
    total: r.total_price,
    status: r.status,
  }));
  const counts: Record<string, number> = {};
  for (const o of all) counts[o.status] = (counts[o.status] ?? 0) + 1;
  return (
    <OrderApprovalView
      orders={filter === "ALL" ? all : all.filter((o) => o.status === filter)}
      filter={filter}
      counts={counts}
    />
  );
}
