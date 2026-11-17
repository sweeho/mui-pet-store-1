/** @jest-environment node */
import { getDb } from "@/db/client";
import { sql } from "drizzle-orm";

import type { Db } from "./queries";
import { addCategory, addItem, addProduct, count, resetData, rows } from "./fixtures.test";

let db: Db;
beforeAll(async () => {
  db = await getDb();
});
beforeEach(async () => {
  await resetData(db);
});
const run = (q: string) => db.run(sql.raw(q));

async function indexedOn(table: string, column: string): Promise<boolean> {
  for (const ix of await rows<{ name: string }>(db, `PRAGMA index_list('${table}')`)) {
    const cols = await rows<{ name: string }>(db, `PRAGMA index_info('${ix.name}')`);
    if (cols.some((c) => c.name === column)) return true;
  }
  return false;
}

describe("catalog data model", () => {
  it("[SWHM2-C-0001] item detail without unit cost is rejected", async () => {
    await addCategory(db, "C1", "Cat");
    await addProduct(db, "P1", "C1", "Prod");
    await run(`INSERT INTO item(itemid, productid) VALUES ('I1', 'P1')`);
    await expect(
      run(
        `INSERT INTO item_details(itemid, locale, list_price, unit_cost, image, descn) VALUES ('I1', 'en', 5, NULL, 'i.gif', 'd')`,
      ),
    ).rejects.toThrow(/NOT NULL/i);
    expect(await count(db, "item_details")).toBe(0);
  });

  it("[SWHM2-C-0002] index exists on product category id", async () => {
    expect(await indexedOn("product", "catid")).toBe(true);
  });

  it("[SWHM2-C-0003] index exists on item product id", async () => {
    expect(await indexedOn("item", "productid")).toBe(true);
  });

  it("[SWHM2-C-0005] category detail is keyed by category and locale, name required", async () => {
    await run(`INSERT INTO category(catid) VALUES ('C1')`);
    await run(`INSERT INTO category_details(catid, locale, name) VALUES ('C1', 'en', 'Fish')`);
    await expect(
      run(`INSERT INTO category_details(catid, locale, name) VALUES ('C1', 'en', 'Again')`),
    ).rejects.toThrow(/UNIQUE|PRIMARY/i);
    await expect(
      run(`INSERT INTO category_details(catid, locale, name) VALUES ('C1', 'fr', NULL)`),
    ).rejects.toThrow(/NOT NULL/i);
    expect(await count(db, "category_details")).toBe(1);
  });

  it("[SWHM2-C-0006] item with nonexistent product is rejected", async () => {
    await expect(run(`INSERT INTO item(itemid, productid) VALUES ('I1', 'NOPE')`)).rejects.toThrow(
      /FOREIGN KEY/i,
    );
    expect(await count(db, "item")).toBe(0);
  });

  it("[SWHM2-C-0007] product without category is rejected", async () => {
    await expect(run(`INSERT INTO product(productid, catid) VALUES ('P1', NULL)`)).rejects.toThrow(
      /NOT NULL/i,
    );
    await expect(
      run(`INSERT INTO product(productid, catid) VALUES ('P2', 'NOPE')`),
    ).rejects.toThrow(/FOREIGN KEY/i);
    expect(await count(db, "product")).toBe(0);
  });

  it("[SWHM2-C-0008] product detail without name is rejected", async () => {
    await addCategory(db, "C1", "Cat");
    await run(`INSERT INTO product(productid, catid) VALUES ('P1', 'C1')`);
    await expect(
      run(`INSERT INTO product_details(productid, locale, name) VALUES ('P1', 'en', NULL)`),
    ).rejects.toThrow(/NOT NULL/i);
    expect(await count(db, "product_details")).toBe(0);
  });

  it("[SWHM2-C-0019] item with list price below unit cost is accepted", async () => {
    await addCategory(db, "C1", "Cat");
    await addProduct(db, "P1", "C1", "Prod");
    await addItem(db, "I1", "P1", { listPrice: 5, unitCost: 10 });
    const r = await rows<{ list_price: number; unit_cost: number }>(
      db,
      `SELECT list_price, unit_cost FROM item_details WHERE itemid = 'I1'`,
    );
    expect(r.map((x) => [Number(x.list_price), Number(x.unit_cost)])).toEqual([[5, 10]]);
  });
});
