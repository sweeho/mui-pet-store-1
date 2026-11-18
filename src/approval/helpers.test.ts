import { sql } from "drizzle-orm";

import { useIsolatedDatabase } from "@/db/isolated";

// Aliased: the react-hooks lint rule reads the "use" prefix as a hook.
const openIsolatedDatabase = useIsolatedDatabase;

export type ApprovalEnv = {
  db: Awaited<ReturnType<typeof useIsolatedDatabase>>;
  now: () => Date;
  approvalQueue: string[];
  supplierQueue: string[];
  notifyList: string[];
  origin?: "auto" | "admin";
};

export type TestEnv = {
  env: ApprovalEnv;
  approvalQueue: string[];
  supplierQueue: string[];
  notifyList: string[];
};

/** A fresh env on this file's own database, with the order tables emptied. */
export async function makeEnv(): Promise<TestEnv> {
  const db = await openIsolatedDatabase();
  for (const t of ["order_manager", "order_line", "purchase_order"]) {
    await db.run(sql.raw(`DELETE FROM ${t}`));
  }
  const approvalQueue: string[] = [];
  const supplierQueue: string[] = [];
  const notifyList: string[] = [];
  const env: ApprovalEnv = {
    db,
    now: () => new Date(2026, 10, 18, 9, 0, 0),
    approvalQueue,
    supplierQueue,
    notifyList,
  };
  return { env, approvalQueue, supplierQueue, notifyList };
}

/** Seeds an order with the given status and `lineCount` lines. */
export async function seedOrder(
  env: ApprovalEnv,
  id: number,
  status: string,
  lineCount = 2,
): Promise<void> {
  await env.db.run(
    sql`INSERT INTO purchase_order (order_id, user_name, order_time, locale, total_price, status)
        VALUES (${id}, 'j2ee', ${Date.UTC(2026, 10, 18)}, 'en_US', 1000, ${status})`,
  );
  await env.db.run(sql`INSERT INTO order_manager (order_id, status) VALUES (${id}, ${status})`);
  for (let n = 1; n <= lineCount; n++) {
    await env.db.run(
      sql`INSERT INTO order_line (order_id, line_num, category_id, product_id, item_id, quantity, unit_price)
          VALUES (${id}, ${n}, 'FISH', 'FI-SW', ${`EST-${n}`}, 2, 9.99)`,
    );
  }
}

export function po(orderId: number, locale: string, total: number) {
  return {
    orderId,
    userName: "j2ee",
    locale,
    total,
    lines: [
      {
        lineNum: 1,
        categoryId: "FISH",
        productId: "FI-SW",
        itemId: "EST-1",
        quantity: 1,
        unitPrice: total,
      },
    ],
  };
}

export function approvalXml(entries: [number, "APPROVED" | "DENIED"][]): string {
  const orders = entries
    .map(([id, s]) => `<Order><OrderId>${id}</OrderId><OrderStatus>${s}</OrderStatus></Order>`)
    .join("");
  return `<OrderApproval>${orders}</OrderApproval>`;
}

test("approvalXml writes one Order entry per decision", () => {
  expect(approvalXml([[1, "APPROVED"]])).toBe(
    "<OrderApproval><Order><OrderId>1</OrderId><OrderStatus>APPROVED</OrderStatus></Order></OrderApproval>",
  );
});
