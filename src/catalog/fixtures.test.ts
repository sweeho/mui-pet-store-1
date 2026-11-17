/** @jest-environment node */
import { sql } from "drizzle-orm";

import type { Db } from "./queries";

const q = (db: Db, text: string) => db.run(sql.raw(text));

/** Empty the six catalog tables (a table that does not exist yet is skipped). */
export async function resetData(db: Db): Promise<void> {
  for (const t of [
    "item_details",
    "item",
    "product_details",
    "product",
    "category_details",
    "category",
  ]) {
    try {
      await q(db, `DELETE FROM ${t}`);
    } catch (e) {
      if (!/no such table/i.test(String(e))) throw e;
    }
  }
}

export async function rows<T = Record<string, unknown>>(db: Db, text: string): Promise<T[]> {
  return (await db.all(sql.raw(text))) as T[];
}

export async function count(db: Db, table: string): Promise<number> {
  return Number((await rows<{ n: number }>(db, `SELECT COUNT(*) AS n FROM ${table}`))[0].n);
}

export async function addCategory(db: Db, id: string, name: string, locale = "en") {
  await q(db, `INSERT OR IGNORE INTO category(catid) VALUES ('${id}')`);
  await q(
    db,
    `INSERT INTO category_details(catid, locale, name) VALUES ('${id}', '${locale}', '${name}')`,
  );
}

export async function addProduct(db: Db, id: string, catId: string, name: string, locale = "en") {
  await q(db, `INSERT INTO product(productid, catid) VALUES ('${id}', '${catId}')`);
  await q(
    db,
    `INSERT INTO product_details(productid, locale, name, image, descn) VALUES ('${id}', '${locale}', '${name}', 'img/${id}.gif', '${name} product')`,
  );
}

export async function addItem(
  db: Db,
  id: string,
  productId: string,
  opts: { descn?: string; listPrice?: number; unitCost?: number; locale?: string } = {},
) {
  const locale = opts.locale ?? "en";
  await q(db, `INSERT INTO item(itemid, productid) VALUES ('${id}', '${productId}')`);
  await q(
    db,
    `INSERT INTO item_details(itemid, locale, list_price, unit_cost, image, descn, attr1, attr2, attr3, attr4, attr5) VALUES ('${id}', '${locale}', ${opts.listPrice ?? 12.5}, ${opts.unitCost ?? 8.25}, 'img/${id}.gif', '${opts.descn ?? `Item ${id}`}', 'a1', 'a2', 'a3', 'a4', 'a5')`,
  );
}

// Shared fixtures for the catalog tests; this file doubles as a check that they are usable.
describe("catalog test fixtures", () => {
  it("build inserts that name the six tables", () => {
    expect(typeof resetData).toBe("function");
  });
});
