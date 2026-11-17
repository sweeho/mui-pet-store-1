import type { getDb } from "@/db/client";
import { type SQL, sql } from "drizzle-orm";

import { configuredStatements } from "./dialect";
import { guarded } from "./errors";
import type {
  CatalogItem,
  CategoryEntry,
  Page,
  PageRequest,
  ProductDetail,
  ProductEntry,
} from "./types";

export type { CatalogItem, CategoryEntry, Page, PageRequest, ProductDetail, ProductEntry };
export type Db = Awaited<ReturnType<typeof getDb>>;

const EMPTY = { entries: [], hasNext: false } as const;

/** The columns and joins every item read shares, in the requested locale. */
export const ITEM_SELECT = (locale: string): SQL => sql`
  SELECT p.catid AS categoryId, i.productid AS productId, pd.name AS productName,
         i.itemid AS itemId, d.image AS image, d.descn AS description,
         d.attr1 AS attr1, d.attr2 AS attr2, d.attr3 AS attr3, d.attr4 AS attr4, d.attr5 AS attr5,
         d.list_price AS listPrice, d.unit_cost AS unitCost
  FROM item i
  JOIN item_details d ON d.itemid = i.itemid AND d.locale = ${locale}
  JOIN product p ON p.productid = i.productid
  JOIN product_details pd ON pd.productid = p.productid AND pd.locale = ${locale}`;

/**
 * Run a paged SELECT: fetch one row more than the page to learn whether a next page exists. A
 * negative offset or a size of zero or less is an empty page and never reaches the store.
 */
export async function pagedAll<T>(
  db: Db,
  page: PageRequest,
  build: (paging: SQL) => SQL,
): Promise<Page<T>> {
  if (!(page.offset >= 0) || !(page.size > 0)) return { ...EMPTY, entries: [] };
  const rows = await guarded(
    () => db.all(build(configuredStatements().page(page.size + 1, page.offset))) as Promise<T[]>,
  );
  return { entries: rows.slice(0, page.size), hasNext: rows.length > page.size };
}

export function listCategories(db: Db, page: PageRequest): Promise<Page<CategoryEntry>> {
  return pagedAll(
    db,
    page,
    (paging) => sql`
      SELECT c.catid AS id, d.name AS name
      FROM category c JOIN category_details d ON d.catid = c.catid AND d.locale = ${page.locale}
      ORDER BY d.name, c.catid ${paging}`,
  );
}

export function listProducts(
  db: Db,
  categoryId: string,
  page: PageRequest,
): Promise<Page<ProductEntry>> {
  return pagedAll(
    db,
    page,
    (paging) => sql`
      SELECT p.productid AS id, p.catid AS categoryId, d.name AS name
      FROM product p JOIN product_details d ON d.productid = p.productid AND d.locale = ${page.locale}
      WHERE p.catid = ${categoryId}
      ORDER BY d.name, p.productid ${paging}`,
  );
}

export function listItems(
  db: Db,
  productId: string,
  page: PageRequest,
): Promise<Page<CatalogItem>> {
  return pagedAll(
    db,
    page,
    (paging) => sql`${ITEM_SELECT(page.locale)} WHERE i.productid = ${productId}
      ORDER BY i.itemid ${paging}`,
  );
}

async function first<T>(db: Db, query: SQL): Promise<T | null> {
  const rows = (await guarded(() => db.all(query) as Promise<T[]>)) ?? [];
  return rows[0] ?? null;
}

export function getCategory(db: Db, id: string, locale: string): Promise<CategoryEntry | null> {
  return first(
    db,
    sql`SELECT c.catid AS id, d.name AS name
        FROM category c JOIN category_details d ON d.catid = c.catid AND d.locale = ${locale}
        WHERE c.catid = ${id}`,
  );
}

export function getProduct(db: Db, id: string, locale: string): Promise<ProductDetail | null> {
  return first(
    db,
    sql`SELECT p.productid AS id, p.catid AS categoryId, d.name AS name,
               d.image AS image, d.descn AS description
        FROM product p JOIN product_details d ON d.productid = p.productid AND d.locale = ${locale}
        WHERE p.productid = ${id}`,
  );
}

export function getItem(db: Db, itemId: string, locale: string): Promise<CatalogItem | null> {
  return first(db, sql`${ITEM_SELECT(locale)} WHERE i.itemid = ${itemId}`);
}
