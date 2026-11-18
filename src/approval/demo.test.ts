/** @jest-environment node */
import { sql } from "drizzle-orm";

import { useIsolatedDatabase } from "@/db/isolated";

test("the demo data holds at least 4 PENDING and 1 APPROVED order, each with two lines", async () => {
  const db = await useIsolatedDatabase();
  const count = async (status: string) =>
    Number(
      (
        (await db.all(
          sql`SELECT COUNT(*) AS n FROM purchase_order WHERE order_id LIKE 'DEMO-%' AND status = ${status}`,
        )) as { n: number }[]
      )[0].n,
    );
  expect(await count("PENDING")).toBeGreaterThanOrEqual(4);
  expect(await count("APPROVED")).toBeGreaterThanOrEqual(1);
  const lines = (await db.all(
    sql`SELECT COUNT(*) AS n FROM order_line WHERE order_id = 'DEMO-0001'`,
  )) as { n: number }[];
  expect(Number(lines[0].n)).toBe(2);
});
