/** @jest-environment node */
import { getDb } from "@/db/client";
import { statementsFor } from "@/catalog/dialect";
import { splitKeywords } from "@/catalog/keywords";
import { getCategory, getItem, listCategories, listItems, listProducts } from "@/catalog/queries";
import { searchItems } from "@/catalog/search";
import { sql } from "drizzle-orm";
import { type Db, addCategory, addItem, addProduct, count, resetData, rows } from "./harness";

let db: Db;

beforeAll(async () => {
  db = await getDb();
});

beforeEach(async () => {
  await resetData(db);
});

const run = (q: string) => db.run(sql.raw(q));

describe("catalog-browsing data model", () => {
  // case: SWHM2-C-0001@v1
  it("SWHM2-C-0001 item detail without unit cost is rejected", async () => {
    await addCategory(db, "C1", "Cat");
    await addProduct(db, "P1", "C1", "Prod");
    await run(`INSERT INTO item(itemid, productid) VALUES ('I1', 'P1')`);
    await expect(
      run(
        `INSERT INTO item_details(itemid, locale, list_price, unit_cost, image, descn) VALUES ('I1', 'en', 5, NULL, 'i.gif', 'd')`,
      ),
    ).rejects.toThrow(/NOT NULL|constraint/i);
    expect(await count(db, "item_details")).toBe(0);
  });

  // case: SWHM2-C-0002@v1
  it("SWHM2-C-0002 index exists on product category id", async () => {
    const indexes = await rows<{ name: string }>(db, `PRAGMA index_list('product')`);
    const covering = [];
    for (const ix of indexes) {
      const cols = await rows<{ name: string }>(db, `PRAGMA index_info('${ix.name}')`);
      if (cols.some((c) => c.name === "catid")) covering.push(ix.name);
    }
    expect(covering.length).toBeGreaterThan(0);
  });

  // case: SWHM2-C-0003@v1
  it("SWHM2-C-0003 index exists on item product id", async () => {
    const indexes = await rows<{ name: string }>(db, `PRAGMA index_list('item')`);
    const covering = [];
    for (const ix of indexes) {
      const cols = await rows<{ name: string }>(db, `PRAGMA index_info('${ix.name}')`);
      if (cols.some((c) => c.name === "productid")) covering.push(ix.name);
    }
    expect(covering.length).toBeGreaterThan(0);
  });

  // case: SWHM2-C-0005@v1
  it("SWHM2-C-0005 category detail is keyed by category and locale, name required", async () => {
    await run(`INSERT INTO category(catid) VALUES ('C1')`);
    await run(`INSERT INTO category_details(catid, locale, name) VALUES ('C1', 'en', 'Fish')`);
    await expect(
      run(`INSERT INTO category_details(catid, locale, name) VALUES ('C1', 'en', 'Again')`),
    ).rejects.toThrow(/UNIQUE|PRIMARY|constraint/i);
    await expect(
      run(`INSERT INTO category_details(catid, locale, name) VALUES ('C1', 'fr', NULL)`),
    ).rejects.toThrow(/NOT NULL|constraint/i);
    expect(await count(db, "category_details")).toBe(1);
  });

  // case: SWHM2-C-0006@v1
  it("SWHM2-C-0006 item with nonexistent product is rejected", async () => {
    await expect(run(`INSERT INTO item(itemid, productid) VALUES ('I1', 'NOPE')`)).rejects.toThrow(
      /FOREIGN KEY|constraint/i,
    );
    expect(await count(db, "item")).toBe(0);
  });

  // case: SWHM2-C-0007@v1
  it("SWHM2-C-0007 product without category is rejected", async () => {
    await expect(run(`INSERT INTO product(productid, catid) VALUES ('P1', NULL)`)).rejects.toThrow(
      /NOT NULL|constraint/i,
    );
    await expect(
      run(`INSERT INTO product(productid, catid) VALUES ('P2', 'NOPE')`),
    ).rejects.toThrow(/FOREIGN KEY|constraint/i);
    expect(await count(db, "product")).toBe(0);
  });

  // case: SWHM2-C-0008@v1
  it("SWHM2-C-0008 product detail without name is rejected", async () => {
    await addCategory(db, "C1", "Cat");
    await run(`INSERT INTO product(productid, catid) VALUES ('P1', 'C1')`);
    await expect(
      run(`INSERT INTO product_details(productid, locale, name) VALUES ('P1', 'en', NULL)`),
    ).rejects.toThrow(/NOT NULL|constraint/i);
    expect(await count(db, "product_details")).toBe(0);
  });

  // case: SWHM2-C-0019@v1
  it("SWHM2-C-0019 item with list price below unit cost is accepted", async () => {
    await addCategory(db, "C1", "Cat");
    await addProduct(db, "P1", "C1", "Prod");
    await addItem(db, "I1", "P1", { listPrice: 5, unitCost: 10 });
    const r = await rows<{ list_price: number; unit_cost: number }>(
      db,
      `SELECT list_price, unit_cost FROM item_details WHERE itemid = 'I1'`,
    );
    expect(r).toHaveLength(1);
    expect(Number(r[0].list_price)).toBe(5);
    expect(Number(r[0].unit_cost)).toBe(10);
  });
});

describe("catalog-browsing configuration", () => {
  // case: SWHM2-C-0004@v1
  it("SWHM2-C-0004 statement set is chosen by configured database identifier", () => {
    const a = statementsFor("cloudscape");
    const b = statementsFor("oracle");
    expect(a.id).toBe("cloudscape");
    expect(b.id).toBe("oracle");
    expect(a).not.toBe(b);
    expect(statementsFor("cloudscape")).toBe(a);
  });
});

describe("catalog-browsing queries", () => {
  async function seedCategories() {
    for (const [id, name] of [
      ["C3", "Dogs"],
      ["C1", "Birds"],
      ["C5", "Reptiles"],
      ["C2", "Cats"],
      ["C4", "Fish"],
    ]) {
      await addCategory(db, id, name);
    }
  }

  // case: SWHM2-C-0009@v1
  it("SWHM2-C-0009 offset beyond last row returns an empty page", async () => {
    await seedCategories();
    const page = await listCategories(db, { locale: "en", offset: 100, size: 10 });
    expect(page.entries).toEqual([]);
  });

  // case: SWHM2-C-0010@v1
  it("SWHM2-C-0010 unreachable data store gives a system error with the message", async () => {
    const fail = () => Promise.reject(new Error("connection refused: store is down"));
    const broken = { all: fail, get: fail, run: fail, execute: fail } as unknown as Db;
    await expect(listCategories(broken, { locale: "en", offset: 0, size: 10 })).rejects.toThrow(
      /connection refused: store is down/,
    );
  });

  // case: SWHM2-C-0011@v1
  it("SWHM2-C-0011 categories are listed by name with paging", async () => {
    await seedCategories();
    const p1 = await listCategories(db, { locale: "en", offset: 0, size: 2 });
    const p2 = await listCategories(db, { locale: "en", offset: 2, size: 2 });
    expect(p1.entries.map((c) => c.name)).toEqual(["Birds", "Cats"]);
    expect(p2.entries.map((c) => c.name)).toEqual(["Dogs", "Fish"]);
  });

  // case: SWHM2-C-0012@v1
  it("SWHM2-C-0012 items of a product are returned with full fields, paged", async () => {
    await addCategory(db, "C1", "Cat");
    await addProduct(db, "P1", "C1", "Prod");
    for (const id of ["I1", "I2", "I3"])
      await addItem(db, id, "P1", { listPrice: 12.5, unitCost: 8.25 });
    const p1 = await listItems(db, "P1", { locale: "en", offset: 0, size: 2 });
    const p2 = await listItems(db, "P1", { locale: "en", offset: 2, size: 2 });
    expect(p1.entries).toHaveLength(2);
    expect(p2.entries).toHaveLength(1);
    const all = [...p1.entries, ...p2.entries];
    expect(all.map((i) => i.itemId).sort()).toEqual(["I1", "I2", "I3"]);
    for (const i of all) {
      expect(i.image).toBeTruthy();
      expect(i.description).toBeTruthy();
      expect([i.attr1, i.attr2, i.attr3, i.attr4, i.attr5]).toEqual(["a1", "a2", "a3", "a4", "a5"]);
      expect(Number(i.listPrice)).toBe(12.5);
      expect(Number(i.unitCost)).toBe(8.25);
    }
  });

  // case: SWHM2-C-0013@v1
  it("SWHM2-C-0013 lookup of an id absent in the locale returns nothing", async () => {
    await addCategory(db, "C1", "Fish", "en");
    await expect(getCategory(db, "C1", "fr")).resolves.toBeNull();
    await expect(getCategory(db, "C1", "en")).resolves.toMatchObject({ id: "C1", name: "Fish" });
  });

  // case: SWHM2-C-0016@v1
  it("SWHM2-C-0016 products of a category are listed by name, paged", async () => {
    await addCategory(db, "C1", "Cat");
    await addProduct(db, "P2", "C1", "Zebra");
    await addProduct(db, "P1", "C1", "Aardvark");
    await addProduct(db, "P3", "C1", "Mouse");
    const p1 = await listProducts(db, "C1", { locale: "en", offset: 0, size: 2 });
    const p2 = await listProducts(db, "C1", { locale: "en", offset: 2, size: 2 });
    expect(p1.entries.map((p) => p.name)).toEqual(["Aardvark", "Mouse"]);
    expect(p2.entries.map((p) => p.name)).toEqual(["Zebra"]);
  });

  // case: SWHM2-C-0020@v1
  it("SWHM2-C-0020 a returned item carries all required fields", async () => {
    await addCategory(db, "C1", "Cat");
    await addProduct(db, "P1", "C1", "Parrot");
    await addItem(db, "I1", "P1", { descn: "Green bird", listPrice: 20, unitCost: 15 });
    const item = await getItem(db, "I1", "en");
    expect(item).toMatchObject({
      categoryId: "C1",
      productId: "P1",
      productName: "Parrot",
      itemId: "I1",
      image: "img/I1.gif",
      description: "Green bird",
      attr1: "a1",
      attr2: "a2",
      attr3: "a3",
      attr4: "a4",
      attr5: "a5",
    });
    expect(Number(item?.listPrice)).toBe(20);
    expect(Number(item?.unitCost)).toBe(15);
  });
});

describe("catalog-browsing search", () => {
  // case: SWHM2-C-0014@v1
  it("SWHM2-C-0014 whitespace-only search returns an empty page without querying", async () => {
    const calls: string[] = [];
    const spy = new Proxy(
      {},
      {
        get: (_t, prop) => {
          calls.push(String(prop));
          return () => {
            calls.push(`call:${String(prop)}`);
            return Promise.resolve([]);
          };
        },
      },
    ) as unknown as Db;
    const page = await searchItems(spy, "   ", { locale: "en", offset: 0, size: 10 });
    expect(page.entries).toEqual([]);
    expect(calls.filter((c) => c.startsWith("call:"))).toHaveLength(0);
  });

  // case: SWHM2-C-0015@v1
  it("SWHM2-C-0015 keywords are split on locale word boundaries, blanks dropped", () => {
    expect(splitKeywords(" red  dog ", "en")).toEqual(["red", "dog"]);
    const tokens = splitKeywords("  one \t two\n\n three   ", "en");
    expect(tokens).toEqual(["one", "two", "three"]);
    expect(tokens.every((t) => t.trim() !== "")).toBe(true);
  });

  // case: SWHM2-C-0017@v1
  it("SWHM2-C-0017 two-keyword search matches either keyword, case-insensitive", async () => {
    await addCategory(db, "CAT-B", "Birds");
    await addCategory(db, "CAT-D", "Dogs");
    await addCategory(db, "CAT-F", "Fish");
    await addProduct(db, "P1", "CAT-B", "Parrot");
    await addProduct(db, "P2", "CAT-D", "Bulldog");
    await addProduct(db, "P3", "CAT-F", "Goldfish");
    await addProduct(db, "P4", "CAT-F", "Shark");
    await addItem(db, "I1", "P1", { descn: "Colourful talker" });
    await addItem(db, "I2", "P2", { descn: "Barks LOUDLY" });
    await addItem(db, "I3", "P3", { descn: "Quiet swimmer" });
    await addItem(db, "I4", "P4", { descn: "Toothy swimmer" });
    const page = { locale: "en", offset: 0, size: 20 };

    const byDesc = await searchItems(db, "pArRoT loudly", page);
    expect(byDesc.entries.map((i) => i.itemId).sort()).toEqual(["I1", "I2"]);

    const byCategory = await searchItems(db, "PARROT cat-f", page);
    expect(byCategory.entries.map((i) => i.itemId).sort()).toEqual(["I1", "I3", "I4"]);
  });
});
