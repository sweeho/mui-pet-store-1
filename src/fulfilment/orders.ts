import type { FulfilEnv } from "./env";
import type { LineItem, LineRow, Shipping } from "./documents";

export const ORDER_STATUSES = [
  "PENDING",
  "APPROVED",
  "DENIED",
  "COMPLETED",
  "SHIPPED_PART",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export function isOrderStatus(_s: string): _s is OrderStatus {
  throw new Error("VortexNotImplemented");
}

export type SupplierOrderInput = {
  orderId: string;
  date: Date;
  shipping: Shipping;
  lines: LineItem[];
};
export type SupplierOrder = {
  orderId: string;
  date: number;
  status: string;
  contactId: number;
  shipping: Shipping;
  lines: LineRow[];
};
export type PurchaseOrderInput = {
  orderId: string;
  userName: string;
  shipping: Shipping;
  lines: LineItem[];
};
export type PurchaseOrder = {
  orderId: string;
  billing: Shipping;
  shipping: Shipping;
  contactId: number;
  lines: LineRow[];
};
export type OrderStatusRow = {
  orderId: string | number;
  userName: string;
  date: number;
  value: number;
  status: string;
};

const todo = (): never => {
  throw new Error("VortexNotImplemented");
};

export async function createSupplierOrder(_env: FulfilEnv, _o: SupplierOrderInput): Promise<void> {
  return todo();
}
export async function getSupplierOrder(_env: FulfilEnv, _id: string): Promise<SupplierOrder> {
  return todo();
}
export async function getLineItems(_env: FulfilEnv, _id: string): Promise<LineRow[]> {
  return todo();
}
export async function approveOrder(_env: FulfilEnv, _id: string): Promise<void> {
  return todo();
}
export async function findOrdersByStatus(_env: FulfilEnv, _status: string): Promise<string[]> {
  return todo();
}
export async function listOrderStatus(_env: FulfilEnv): Promise<OrderStatusRow[]> {
  return todo();
}
export async function createPurchaseOrder(_env: FulfilEnv, _o: PurchaseOrderInput): Promise<void> {
  return todo();
}
export async function getPurchaseOrder(_env: FulfilEnv, _id: string): Promise<PurchaseOrder> {
  return todo();
}
export async function purgeSupplierOrders(_env: FulfilEnv, _ids: string[]): Promise<void> {
  return todo();
}
export function parseSupplierOrderMessage(
  _xml: string,
  _options?: { now?: () => Date },
): SupplierOrderInput {
  return todo();
}
