import { sql } from "drizzle-orm";

import type { Exec } from "@/accounts/store";

export type ReportQuery = { start: string; end: string; type: string; category?: string };
export type ReportResult = { rows: { name: string; value: number }[]; total: number };

export const DATE_FORMAT_MESSAGE = "Enter the date as MM/dd/yyyy, for example 10/31/2026.";

/** Strict MM/dd/yyyy to local midnight, or null when it is not a real calendar date. */
function parseDate(text: string): Date | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text);
  if (!m) return null;
  const [month, day, year] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day ? d : null;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Revenue (quantity x list price in the order's locale, else en_US) or, for any other type, quantity
 * (R-0138), per category, or per item of `category`. Every order in the range counts (design.md P6).
 */
export async function salesReport(
  db: Exec,
  q: ReportQuery,
): Promise<ReportResult | { error: string }> {
  const start = parseDate(q.start);
  const end = parseDate(q.end);
  if (!start || !end) return { error: DATE_FORMAT_MESSAGE };
  const until = new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1).getTime();
  const measure =
    q.type === "REVENUE"
      ? sql`ol.quantity * COALESCE(
          (SELECT d.list_price FROM item_details d WHERE d.itemid = i.itemid AND d.locale = po.locale),
          (SELECT d.list_price FROM item_details d WHERE d.itemid = i.itemid AND d.locale = 'en_US'),
          0)`
      : sql`ol.quantity`;
  const group = q.category ? sql`i.itemid` : sql`p.catid`;
  const filter = q.category ? sql`AND p.catid = ${q.category}` : sql``;
  const rows = (await db.all(
    sql`SELECT ${group} AS name, SUM(${measure}) AS value
        FROM order_line ol
        JOIN purchase_order po ON po.order_id = ol.order_id
        JOIN item i ON i.itemid = ol.item_id
        JOIN product p ON p.productid = i.productid
        WHERE po.order_time >= ${start.getTime()} AND po.order_time < ${until} ${filter}
        GROUP BY name ORDER BY value DESC, name`,
  )) as { name: string; value: number }[];
  const out = rows.map((r) => ({ name: r.name, value: round2(Number(r.value)) }));
  return { rows: out, total: round2(out.reduce((sum, r) => sum + r.value, 0)) };
}

/** The same figures for the rich client's chart (R-0138). */
export const getChartInfo = salesReport;
