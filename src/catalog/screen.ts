/** Rows per screen on every catalog listing. */
export const PAGE_SIZE = 10;

/** Locale the storefront reads until Localisation ships (design.md P9). */
export const STOREFRONT_LOCALE = "en_US";

/** A 1-based `?page=` value as the screen's page number, offset and request. */
export function pageRequest(raw: string | string[] | undefined) {
  const n = Number(Array.isArray(raw) ? raw[0] : raw);
  const pageNumber = Number.isInteger(n) && n >= 1 ? n : 1;
  const offset = (pageNumber - 1) * PAGE_SIZE;
  return { pageNumber, offset, request: { locale: STOREFRONT_LOCALE, offset, size: PAGE_SIZE } };
}
