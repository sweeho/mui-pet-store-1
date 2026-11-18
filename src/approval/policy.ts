// Automatic approval limits (R-0174, R-0175, R-0171): strict, and only for these two locales.
const LIMITS: Record<string, number> = { en_US: 500, ja_JP: 50000 };

export function canApprove(order: { locale: string; total: number }): boolean {
  const limit = LIMITS[order.locale];
  return limit !== undefined && order.total < limit;
}
