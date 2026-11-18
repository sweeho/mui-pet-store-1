/** The shopping cart: one quantity per item id, in insertion order (design.md P1). */
export type Cart = Map<string, number>;

const NOT_IMPLEMENTED = "VortexNotImplemented";

export function createCart(): Cart {
  throw new Error(NOT_IMPLEMENTED);
}
export function addItem(_cart: Cart, _itemId: string, _quantity?: number): void {
  throw new Error(NOT_IMPLEMENTED);
}
export function updateQuantity(_cart: Cart, _itemId: string, _quantity: number | string): void {
  throw new Error(NOT_IMPLEMENTED);
}
export function removeItem(_cart: Cart, _itemId: string): void {
  throw new Error(NOT_IMPLEMENTED);
}
export function emptyCart(_cart: Cart): void {
  throw new Error(NOT_IMPLEMENTED);
}
export function getQuantity(_cart: Cart, _itemId: string): number | undefined {
  throw new Error(NOT_IMPLEMENTED);
}
export function getItemIds(_cart: Cart): string[] {
  throw new Error(NOT_IMPLEMENTED);
}
export function getItemCount(_cart: Cart): number {
  throw new Error(NOT_IMPLEMENTED);
}
