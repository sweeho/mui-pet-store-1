import { sql } from "drizzle-orm";

import type { Exec } from "@/accounts/store";

export type OrderOperation = {
  orderId: string | number;
  userId: string;
  date: string;
  value: number;
  status: string;
};

type ViewRow = {
  order_id: string | number;
  user_name: string;
  order_time: number | bigint;
  total_price: number;
  status: string;
};

/** M/D/YYYY in server local time, unpadded (R-0040). */
function mdy(ms: number): string {
  const d = new Date(ms);
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

const toOperation = (r: ViewRow): OrderOperation => ({
  orderId: r.order_id,
  userId: r.user_name,
  date: mdy(Number(r.order_time)),
  value: r.total_price,
  status: r.status,
});

/** Every order that has a process-manager status row (view v_order_status, design.md P4). */
export async function listOrderOperations(db: Exec): Promise<OrderOperation[]> {
  const rows = (await db.all(
    sql`SELECT order_id, user_name, order_time, total_price, status FROM v_order_status
        ORDER BY order_time, order_id`,
  )) as ViewRow[];
  return rows.map(toOperation);
}

/** The orders whose current status is `status`: the view gives one row per order (R-0121). */
export async function listOrdersByStatus(db: Exec, status: string): Promise<OrderOperation[]> {
  const rows = (await db.all(
    sql`SELECT order_id, user_name, order_time, total_price, status FROM v_order_status
        WHERE status = ${status} ORDER BY order_time, order_id`,
  )) as ViewRow[];
  return rows.map(toOperation);
}
