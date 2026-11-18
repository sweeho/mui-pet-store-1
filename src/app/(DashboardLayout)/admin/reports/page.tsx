import { sql } from "drizzle-orm";

import { salesReport } from "@/admin/reports";
import { requireAdmin } from "@/admin/session";
import { SalesReportView } from "@/components/admin/SalesReportView";
import { getDb } from "@/db/client";

export const dynamic = "force-dynamic";

/** `/admin/reports`: a revenue or quantity report for a date range, as a table and a chart. */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string; type?: string; category?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const db = await getDb();
  const categories = (
    (await db.all(sql`SELECT catid FROM category ORDER BY catid`)) as { catid: string }[]
  ).map((c) => c.catid);
  const query = {
    start: sp.start ?? "",
    end: sp.end ?? "",
    type: sp.type === "QUANTITY" ? "QUANTITY" : "REVENUE",
    category: sp.category ?? "",
  };
  const result =
    sp.start || sp.end
      ? await salesReport(db, { ...query, category: query.category || undefined })
      : null;
  return <SalesReportView query={query} categories={categories} result={result} />;
}
