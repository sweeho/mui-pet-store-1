/**
 * Shared fixture for the shopping-cart acceptance tests. It is also the contract the build must
 * meet; every assumption about names lives here, not in the tests.
 *
 * Product modules (under src/cart/):
 *  - cart.ts (sync, the cart is a mutable object, one per shopper session):
 *      createCart() -> cart; addItem(cart, itemId, quantity?) sets the quantity (replace, never
 *      accumulate), default 1; updateQuantity(cart, itemId, quantity: number | string) removes the
 *      line when the quantity is <= 0 or not a whole number (e.g. "abc"), otherwise sets it;
 *      removeItem(cart, itemId); emptyCart(cart); getQuantity(cart, itemId) -> number | undefined;
 *      getItemIds(cart) -> string[]; getItemCount(cart) -> number of distinct lines.
 *  - listing.ts (async): listCart(cart, { catalog, locale? }) -> { lines, subtotal }.
 *      `catalog(itemId, locale)` is the injected catalog lookup, resolving to a CatalogEntry or
 *      rejecting. `locale` defaults to "en_US". A rejected lookup omits the item from lines and
 *      subtotal and raises nothing. A line is { itemId, productId, categoryId, name, attribute,
 *      quantity, unitCost, total } with total = quantity * unitCost, unrounded;
 *      subtotal = sum of totals.
 * E2E: the catalog item page /catalog/items/EST-1 has an "Add to cart" button; the cart page
 * /cart lists items and has a "Check out" link leading to a URL under /checkout.
 */
import type { listCart } from "@/cart/listing";

export type Catalog = NonNullable<Parameters<typeof listCart>[1]>["catalog"];

export interface Entry {
  productId: string;
  categoryId: string;
  name: string;
  attribute: string;
  listCost: number;
}

export function catalogOf(
  entries: Record<string, Entry | Record<string, Entry>>,
  failing: string[] = [],
): Catalog {
  return (async (itemId: string, locale: string) => {
    if (failing.includes(itemId)) throw new Error(`lookup failed for ${itemId}`);
    const e = entries[itemId] as Entry & Record<string, Entry>;
    return (e[locale] ?? e) as Entry;
  }) as Catalog;
}

export const A: Entry = {
  productId: "P-A",
  categoryId: "C-1",
  name: "Item A",
  attribute: "Large",
  listCost: 10.5,
};
export const B: Entry = {
  productId: "P-B",
  categoryId: "C-2",
  name: "Item B",
  attribute: "Small",
  listCost: 3.25,
};
