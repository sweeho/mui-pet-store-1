import type { Cart } from "./cart";

export type CatalogEntry = {
  productId: string;
  categoryId: string;
  name: string;
  attribute: string;
  listCost: number;
};
export type CartLine = {
  itemId: string;
  productId: string;
  categoryId: string;
  name: string;
  attribute: string;
  quantity: number;
  unitCost: number;
  total: number;
};
export type CatalogLookup = (itemId: string, locale: string) => Promise<CatalogEntry>;

export async function listCart(
  _cart: Cart,
  _opts: { catalog: CatalogLookup; locale?: string },
): Promise<{ lines: CartLine[]; subtotal: number }> {
  throw new Error("VortexNotImplemented");
}
