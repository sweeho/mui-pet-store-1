export const ORDER_STATUSES = ["PENDING", "APPROVED", "DENIED", "COMPLETED"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export async function recordOrderStatus(
  _env: unknown,
  _orderId: string | number,
  _status: string,
): Promise<void> {
  throw new Error("VortexNotImplemented");
}

export async function getOrderStatus(
  _env: unknown,
  _orderId: string | number,
): Promise<string | undefined> {
  throw new Error("VortexNotImplemented");
}
