/** @jest-environment node */
import { useIsolatedDatabase } from "@/db/isolated";

import {
  getCategory,
  getItem,
  getProduct,
  listCategories,
  listItems,
  listProducts,
} from "./queries";
import type { Db } from "./queries";
import { addCategory, addItem, addProduct, resetData } from "./fixtures.test";

let db: Db;
beforeAll(async () => {
  db = await useIsolatedDatabase();
});
beforeEach(async () => {
  await resetData(db);
});

async function seedCategories() {
  for (const [id, name] of [
    ["C3", "Dogs"],
    ["C1", "Birds"],
    ["C5", "Reptiles"],
    ["C2", "Cats"],
    ["C4", "Fish"],
  ])
    await addCategory(db, id, name);
}

describe("catalog queries", () => {
  it("[SWHM2-C-0009] an offset beyond the last row returns an empty page", async () => {
    await seedCategories();
    expect(await listCategories(db, { locale: "en", offset: 100, size: 10 })).toEqual({
      entries: [],
      hasNext: false,
    });
  });

  it("returns an empty page for a negative offset or non-positive size", async () => {
    await seedCategories();
    expect((await listCategories(db, { locale: "en", offset: -1, size: 10 })).entries).toEqual([]);
    expect((await listCategories(db, { locale: "en", offset: 0, size: 0 })).entries).toEqual([]);
  });

  it("[SWHM2-C-0010] an unreachable data store gives a system error with the message", async () => {
    const fail = () => Promise.reject(new Error("connection refused: store is down"));
    const broken = { all: fail, get: fail, run: fail, execute: fail } as unknown as Db;
    const page = { locale: "en", offset: 0, size: 10 };
    await expect(listCategories(broken, page)).rejects.toThrow(/connection refused: store is down/);
    await expect(getItem(broken, "I1", "en")).rejects.toThrow(/connection refused/);
    await expect(getCategory(broken, "C1", "en")).rejects.toThrow(/connection refused/);
  });

  it("[SWHM2-C-0011] categories are listed by name with paging", async () => {
    await seedCategories();
    const p1 = await listCategories(db, { locale: "en", offset: 0, size: 2 });
    const p2 = await listCategories(db, { locale: "en", offset: 2, size: 2 });
    const p3 = await listCategories(db, { locale: "en", offset: 4, size: 2 });
    expect(p1.entries.map((c) => c.name)).toEqual(["Birds", "Cats"]);
    expect(p2.entries.map((c) => c.name)).toEqual(["Dogs", "Fish"]);
    expect([p1.hasNext, p2.hasNext, p3.hasNext]).toEqual([true, true, false]);
  });

  it("[SWHM2-C-0012] items of a product are returned with full fields, paged", async () => {
    await addCategory(db, "C1", "Cat");
    await addProduct(db, "P1", "C1", "Prod");
    for (const id of ["I1", "I2", "I3"]) await addItem(db, id, "P1");
    const p1 = await listItems(db, "P1", { locale: "en", offset: 0, size: 2 });
    const p2 = await listItems(db, "P1", { locale: "en", offset: 2, size: 2 });
    expect([p1.entries.length, p2.entries.length]).toEqual([2, 1]);
    for (const i of [...p1.entries, ...p2.entries]) {
      expect(i.image).toBeTruthy();
      expect(i.description).toBeTruthy();
      expect([i.attr1, i.attr2, i.attr3, i.attr4, i.attr5]).toEqual(["a1", "a2", "a3", "a4", "a5"]);
      expect([i.listPrice, i.unitCost]).toEqual([12.5, 8.25]);
    }
  });

  it("[SWHM2-C-0013] a lookup of an id absent in the locale returns nothing", async () => {
    await addCategory(db, "C1", "Fish", "en");
    await addProduct(db, "P1", "C1", "Angelfish", "en");
    await expect(getCategory(db, "C1", "fr")).resolves.toBeNull();
    await expect(getCategory(db, "C1", "en")).resolves.toEqual({ id: "C1", name: "Fish" });
    await expect(getProduct(db, "P1", "fr")).resolves.toBeNull();
    await expect(getProduct(db, "P1", "en")).resolves.toMatchObject({ name: "Angelfish" });
    await expect(getItem(db, "nope", "en")).resolves.toBeNull();
  });

  it("[SWHM2-C-0016] products of a category are listed by name, paged", async () => {
    await addCategory(db, "C1", "Cat");
    await addProduct(db, "P2", "C1", "Zebra");
    await addProduct(db, "P1", "C1", "Aardvark");
    await addProduct(db, "P3", "C1", "Mouse");
    const p1 = await listProducts(db, "C1", { locale: "en", offset: 0, size: 2 });
    const p2 = await listProducts(db, "C1", { locale: "en", offset: 2, size: 2 });
    expect(p1.entries.map((p) => p.name)).toEqual(["Aardvark", "Mouse"]);
    expect(p2.entries.map((p) => p.name)).toEqual(["Zebra"]);
  });

  it("[SWHM2-C-0020] a returned item carries all required fields", async () => {
    await addCategory(db, "C1", "Cat");
    await addProduct(db, "P1", "C1", "Parrot");
    await addItem(db, "I1", "P1", { descn: "Green bird", listPrice: 20, unitCost: 15 });
    expect(await getItem(db, "I1", "en")).toEqual({
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
      listPrice: 20,
      unitCost: 15,
    });
  });
});
