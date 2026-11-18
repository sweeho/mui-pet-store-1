export type InventoryRow = { itemId: string; quantity: number };

export function InventoryView(_props: { items: InventoryRow[]; updated?: number }): never {
  throw new Error("VortexNotImplemented");
}
