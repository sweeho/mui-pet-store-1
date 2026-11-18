import { type Cart, getItemIds, getQuantity } from "./cart";

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

const DEFAULT_LOCALE = "en_US";

/**
 * The cart's lines from the catalog in `locale` (default US English). An item whose lookup fails
 * is left out of the lines and the subtotal without an error. Totals are not rounded.
 */
export async function listCart(
  cart: Cart,
  { catalog, locale = DEFAULT_LOCALE }: { catalog: CatalogLookup; locale?: string },
): Promise<{ lines: CartLine[]; subtotal: number }> {
  const found = await Promise.all(
    getItemIds(cart).map(async (itemId): Promise<CartLine | null> => {
      const quantity = getQuantity(cart, itemId) ?? 0;
      try {
        const e = await catalog(itemId, locale);
        const { productId, categoryId, name, attribute, listCost } = e;
        return {
          itemId,
          productId,
          categoryId,
          name,
          attribute,
          quantity,
          unitCost: listCost,
          total: quantity * listCost,
        };
      } catch {
        return null;
      }
    }),
  );
  const lines = found.filter((l): l is CartLine => l !== null);
  return { lines, subtotal: lines.reduce((sum, l) => sum + l.total, 0) };
}
