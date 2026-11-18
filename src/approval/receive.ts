export type ReceivedLine = {
  lineNum: number;
  categoryId: string;
  productId: string;
  itemId: string;
  quantity: number;
  unitPrice: number;
};

export type ReceivedOrder = {
  orderId: string | number;
  userName: string;
  locale: string;
  total: number;
  lines: ReceivedLine[];
};

export async function receivePurchaseOrder(_env: unknown, _order: ReceivedOrder): Promise<void> {
  throw new Error("VortexNotImplemented");
}
