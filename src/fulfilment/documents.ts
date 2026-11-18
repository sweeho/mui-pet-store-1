export type LineItem = {
  categoryId: string | null;
  productId: string | null;
  itemId: string;
  lineNum: number;
  quantity: number;
  unitPrice: number | null;
};
export type LineRow = LineItem & { quantityShipped: number };
export type Shipping = { name: string; address: string; email: string; phone: string };

export function toLineItem(_row: LineItem): LineItem {
  throw new Error("VortexNotImplemented");
}

export function buildSupplierOrderXml(_order: {
  orderId: string;
  date: Date;
  shipping: Shipping;
  lines: LineItem[];
}): string {
  throw new Error("VortexNotImplemented");
}

export function buildInvoiceXml(_invoice: {
  orderId: string;
  userId: string;
  orderDate: Date;
  shippingDate: Date;
  lines: LineItem[];
}): string {
  throw new Error("VortexNotImplemented");
}

export function parseDocument(_xml: string, _options: { validate: boolean }): string {
  throw new Error("VortexNotImplemented");
}
