import type { Exec } from "@/accounts/store";

export type OrderOperation = {
  orderId: string | number;
  userId: string;
  date: string;
  value: number;
  status: string;
};

/** Every order that has a process-manager status row (view v_order_status). */
export async function listOrderOperations(_db: Exec): Promise<OrderOperation[]> {
  throw new Error("VortexNotImplemented");
}

/** The orders whose current status is `status`, one entry per order, date as M/D/YYYY. */
export async function listOrdersByStatus(_db: Exec, _status: string): Promise<OrderOperation[]> {
  throw new Error("VortexNotImplemented");
}
