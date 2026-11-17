/**
 * Shared fixture for the catalog-browsing acceptance tests. It is also the contract the build must
 * meet; every assumption about names lives here, not in the tests.
 *
 * Tables (SQLite, foreign keys enforced; ids are text up to 10 chars, locale is text such as "en"):
 *  - category(catid PK); category_details(catid, locale, name NOT NULL), PK (catid, locale)
 *  - product(productid PK, catid NOT NULL -> category); index on product(catid)
 *  - product_details(productid, locale, name NOT NULL, image, descn), PK (productid, locale)
 *  - item(itemid PK, productid NOT NULL -> product); index on item(productid)
 *  - item_details(itemid, locale, list_price NOT NULL, unit_cost NOT NULL, image NOT NULL,
 *    descn NOT NULL, attr1..attr5), PK (itemid, locale); no check between list_price and unit_cost.
 *
 * Product modules (under src/catalog/). Async functions take the Drizzle db first and reject with
 * an Error whose message contains the underlying database error message when the store fails.
 * A page request is { locale, offset, size }; a Page is { entries, hasNext }.
 *  - queries.ts: listCategories(db, page) -> Page of { id, name } ordered by name;
 *    listProducts(db, categoryId, page) -> Page of { id, categoryId, name } ordered by name;
 *    listItems(db, productId, page) -> Page of CatalogItem (order unspecified);
 *    getCategory(db, id, locale) -> { id, name } | null; getItem(db, itemId, locale) ->
 *    CatalogItem | null; null when no row exists in that locale.
 *    CatalogItem = { categoryId, productId, productName, itemId, image, description,
 *    attr1..attr5 (string | null), listPrice, unitCost } (prices as numbers).
 *  - search.ts: searchItems(db, query, page) -> Page of CatalogItem. A blank query returns
 *    { entries: [], hasNext: false } and never touches db.
 *  - keywords.ts (sync): splitKeywords(text, locale) -> string[] on locale word boundaries, blank
 *    tokens dropped.
 *  - dialect.ts (sync): statementsFor(databaseId) -> statement set whose `id` is the identifier
 *    ("cloudscape" or "oracle"); the catalog uses the set matching the configured identifier.
 * Browser: POST /api/catalog/populate loads the sample XML data (category "Fish" with product
 * "Angelfish" and item "EST-1" at least). Screens: /catalog (categories, each a link),
 * /catalog/categories/<id> (products), /catalog/products/<id> (items), /catalog/items/<id>,
 * /catalog/search?q=<keywords> (results).
 */
import { sql } from "drizzle-orm";

import { getDb } from "@/db/client";

export type Db = Awaited<ReturnType<typeof getDb>>;

export async function resetData(db: Db): Promise<void> {
  for (const t of [
    "item_details",
    "item",
    "product_details",
    "product",
    "category_details",
    "category",
  ]) {
    await db.run(sql.raw(`DELETE FROM ${t}`));
  }
}

export async function rows<T = Record<string, unknown>>(db: Db, query: string): Promise<T[]> {
  return (await db.all(sql.raw(query))) as T[];
}

export async function count(db: Db, table: string): Promise<number> {
  const r = await rows<{ n: number }>(db, `SELECT COUNT(*) AS n FROM ${table}`);
  return Number(r[0].n);
}

export async function addCategory(db: Db, id: string, name: string | null, locale = "en") {
  await db.run(sql.raw(`INSERT OR IGNORE INTO category(catid) VALUES ('${id}')`));
  if (name !== undefined) {
    await db.run(
      sql.raw(
        `INSERT INTO category_details(catid, locale, name) VALUES ('${id}', '${locale}', ${
          name === null ? "NULL" : `'${name}'`
        })`,
      ),
    );
  }
}

export async function addProduct(db: Db, id: string, catId: string, name: string, locale = "en") {
  await db.run(sql.raw(`INSERT INTO product(productid, catid) VALUES ('${id}', '${catId}')`));
  await db.run(
    sql.raw(
      `INSERT INTO product_details(productid, locale, name, image, descn) VALUES ('${id}', '${locale}', '${name}', 'img/${id}.gif', '${name} product')`,
    ),
  );
}

export async function addItem(
  db: Db,
  id: string,
  productId: string,
  opts: { descn?: string; listPrice?: number; unitCost?: number; locale?: string } = {},
) {
  const locale = opts.locale ?? "en";
  await db.run(sql.raw(`INSERT INTO item(itemid, productid) VALUES ('${id}', '${productId}')`));
  await db.run(
    sql.raw(
      `INSERT INTO item_details(itemid, locale, list_price, unit_cost, image, descn, attr1, attr2, attr3, attr4, attr5) VALUES ('${id}', '${locale}', ${
        opts.listPrice ?? 12.5
      }, ${opts.unitCost ?? 8.25}, 'img/${id}.gif', '${opts.descn ?? `Item ${id}`}', 'a1', 'a2', 'a3', 'a4', 'a5')`,
    ),
  );
}
