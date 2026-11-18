export type SalesReportProps = {
  query: { start: string; end: string; type: string; category: string };
  categories: string[];
  result: { rows: { name: string; value: number }[]; total: number } | { error: string } | null;
};
export function SalesReportView(_p: SalesReportProps): React.ReactElement {
  throw new Error("VortexNotImplemented");
}
