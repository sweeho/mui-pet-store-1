/** The shopping cart: one quantity per item id, in insertion order (design.md P1). */
export type Cart = Map<string, number>;

export function createCart(): Cart {
  return new Map();
}

/** Set the quantity of a line (replace, never accumulate); defaults to 1. */
export function addItem(cart: Cart, itemId: string, quantity = 1): void {
  cart.set(itemId, quantity);
}

/** A whole number as typed or given; anything else (e.g. "abc", "2.5", "") counts as 0. */
function wholeQuantity(quantity: number | string): number {
  if (typeof quantity === "number") return Number.isInteger(quantity) ? quantity : 0;
  const text = quantity.trim();
  return /^-?\d+$/.test(text) ? Number(text) : 0;
}

/** Set a line's quantity; a quantity of 0 or less, or not a whole number, removes the line. */
export function updateQuantity(cart: Cart, itemId: string, quantity: number | string): void {
  const n = wholeQuantity(quantity);
  if (n <= 0) cart.delete(itemId);
  else cart.set(itemId, n);
}

export function removeItem(cart: Cart, itemId: string): void {
  cart.delete(itemId);
}

export function emptyCart(cart: Cart): void {
  cart.clear();
}

export function getQuantity(cart: Cart, itemId: string): number | undefined {
  return cart.get(itemId);
}

export function getItemIds(cart: Cart): string[] {
  return [...cart.keys()];
}

/** The number of distinct lines, not of units. */
export function getItemCount(cart: Cart): number {
  return cart.size;
}
