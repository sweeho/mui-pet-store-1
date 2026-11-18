import { sql } from "drizzle-orm";

import { requireAdmin } from "@/admin/session";
import { InventoryView } from "@/components/fulfilment/InventoryView";
import { getDb } from "@/db/client";

export const dynamic = "force-dynamic";

/** `/admin/inventory`: every item's stock, by item id; `?updated=<n>` shows the Stock updated alert. */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string }>;
}) {
  await requireAdmin();
  const { updated } = await searchParams;
  const rows = (await (
    await getDb()
  ).all(sql`SELECT item_id, quantity FROM inventory ORDER BY item_id`)) as {
    item_id: string;
    quantity: number;
  }[];
  const n = updated !== undefined && /^\d+$/.test(updated) ? Number(updated) : undefined;
  return (
    <InventoryView
      items={rows.map((r) => ({ itemId: r.item_id, quantity: Number(r.quantity) }))}
      updated={n}
    />
  );
}
