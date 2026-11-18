import type { Db } from "@/catalog/queries";

/** The localised name, description and image of one catalog item (SWHM2-R-0001). */
export type CatalogItemText = { name: string; description: string; image: string };

export async function getCatalogItem(
  _db: Db,
  _itemId: string,
  _locale: string,
): Promise<CatalogItemText | null> {
  throw new Error("NOT_IMPLEMENTED");
}
