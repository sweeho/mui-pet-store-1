import type { FulfilEnv } from "./env";

export type InventoryChange = { itemId: string; checked: boolean; value: string };

export async function updateInventory(
  _env: FulfilEnv,
  _changes: InventoryChange[],
): Promise<{ applied: number }> {
  throw new Error("VortexNotImplemented");
}
