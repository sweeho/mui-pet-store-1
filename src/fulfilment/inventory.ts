import { sql } from "drizzle-orm";

import type { FulfilEnv } from "./env";
import { processOrder } from "./fulfilment";
import { findOrdersByStatus } from "./orders";

export type InventoryChange = { itemId: string; checked: boolean; value: string };

/**
 * The stock clerk's update (design.md P9). Only a ticked row with a whole number of 0 or more is
 * applied; blank, negative and non-integer values, and unticked rows, change nothing. Then every
 * PENDING supplier order is retried. Resolves to how many items changed.
 */
export async function updateInventory(
  env: FulfilEnv,
  changes: InventoryChange[],
): Promise<{ applied: number }> {
  let applied = 0;
  for (const c of changes) {
    const value = c.value.trim();
    if (!c.checked || !/^\d+$/.test(value) || !Number.isSafeInteger(Number(value))) continue;
    const rows = await env.db.all(
      sql`UPDATE inventory SET quantity = ${Number(value)} WHERE item_id = ${c.itemId}
          RETURNING item_id`,
    );
    applied += rows.length;
  }
  for (const orderId of await findOrdersByStatus(env, "PENDING")) {
    env.onReprocess?.(orderId);
    await processOrder(env, orderId);
  }
  return { applied };
}
