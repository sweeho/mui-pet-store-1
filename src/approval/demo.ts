import type { Client } from "@libsql/client";

const PENDING_WANTED = 4;
const APPROVED_WANTED = 1;
const PREFIX = "DEMO-";

/**
 * Demo orders for the approval screen (design.md P9): at least 4 PENDING and 1 APPROVED, inserted
 * only as a shortfall so the number of rows stays bounded however often the server starts.
 */
export async function seedDemoOrders(client: Client): Promise<void> {
  const count = async (status: string) =>
    Number(
      (
        await client.execute({
          sql: "SELECT COUNT(*) AS n FROM purchase_order WHERE order_id LIKE ? AND status = ?",
          args: [`${PREFIX}%`, status],
        })
      ).rows[0].n,
    );
  const next = Number(
    (
      await client.execute({
        sql: "SELECT COUNT(*) AS n FROM purchase_order WHERE order_id LIKE ?",
        args: [`${PREFIX}%`],
      })
    ).rows[0].n,
  );
  const missing = [
    ...Array<string>(Math.max(0, PENDING_WANTED - (await count("PENDING")))).fill("PENDING"),
    ...Array<string>(Math.max(0, APPROVED_WANTED - (await count("APPROVED")))).fill("APPROVED"),
  ];
  let n = next;
  for (const status of missing) {
    n += 1;
    const id = `${PREFIX}${String(n).padStart(4, "0")}`;
    const total = 500 + n * 37.5;
    await client.batch(
      [
        {
          sql: `INSERT INTO purchase_order (order_id, user_name, order_time, locale, total_price, status)
                VALUES (?, 'j2ee', ?, 'en_US', ?, ?)`,
          args: [id, Date.UTC(2026, 10, 1) + n * 86_400_000, total, status],
        },
        { sql: "INSERT INTO order_manager (order_id, status) VALUES (?, ?)", args: [id, status] },
        {
          sql: `INSERT INTO order_line (order_id, line_num, category_id, product_id, item_id, quantity, unit_price)
                VALUES (?, 1, 'FISH', 'FI-SW-01', 'EST-1', 2, ?)`,
          args: [id, total / 4],
        },
        {
          sql: `INSERT INTO order_line (order_id, line_num, category_id, product_id, item_id, quantity, unit_price)
                VALUES (?, 2, 'DOGS', 'K9-BD-01', 'EST-6', 1, ?)`,
          args: [id, total / 2],
        },
      ],
      "write",
    );
  }
}
