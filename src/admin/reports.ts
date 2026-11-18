import type { Exec } from "@/accounts/store";

export type ReportQuery = { start: string; end: string; type: string; category?: string };
export type ReportResult = { rows: { name: string; value: number }[]; total: number };

export async function salesReport(
  _db: Exec,
  _q: ReportQuery,
): Promise<ReportResult | { error: string }> {
  throw new Error("VortexNotImplemented");
}

export async function getChartInfo(
  _db: Exec,
  _q: ReportQuery,
): Promise<ReportResult | { error: string }> {
  throw new Error("VortexNotImplemented");
}
