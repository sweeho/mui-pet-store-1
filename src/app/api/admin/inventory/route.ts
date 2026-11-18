import { hasAdminSession, unauthorized } from "@/admin/session";
import { getDb } from "@/db/client";
import { dispatchFulfilment } from "@/fulfilment/dispatch";
import { newFulfilEnv } from "@/fulfilment/env";
import { updateInventory, type InventoryChange } from "@/fulfilment/inventory";

import { seeOther } from "../../accounts/redirects";

const QTY = "qty_";
const TICK = "item_";

/**
 * POST /api/admin/inventory (design.md P9): the stock clerk's form. Fields `qty_<itemId>` and
 * `item_<itemId>` (the tick). Applies the ticked rows, retries the PENDING supplier orders, then
 * redirects to the screen with the number of items changed.
 */
export async function POST(request: Request): Promise<Response> {
  if (!(await hasAdminSession(request))) return unauthorized();
  const form = await request.formData();
  const changes: InventoryChange[] = [];
  for (const [name, value] of form.entries()) {
    if (!name.startsWith(QTY)) continue;
    const itemId = name.slice(QTY.length);
    changes.push({
      itemId,
      checked: form.has(`${TICK}${itemId}`),
      value: typeof value === "string" ? value : "",
    });
  }
  const env = newFulfilEnv(await getDb());
  let applied: number;
  try {
    ({ applied } = await updateInventory(env, changes));
  } finally {
    // Record what the orders that did ship produced, even if a later order failed.
    await dispatchFulfilment(env, "admin");
  }
  return seeOther(`/admin/inventory?updated=${applied}`);
}
