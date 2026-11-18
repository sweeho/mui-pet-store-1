/** @jest-environment node */
import { useIsolatedDatabase } from "@/db/isolated";

import type { Db } from "./queries";
import { searchItems } from "./search";
import { addCategory, addItem, addProduct, resetData } from "./fixtures.test";

let db: Db;
beforeAll(async () => {
  db = await useIsolatedDatabase();
});
beforeEach(async () => {
  await resetData(db);
});

describe("searchItems", () => {
  it("[SWHM2-C-0014] a whitespace-only search returns an empty page without querying", async () => {
    const calls = jest.fn(() => Promise.resolve([]));
    const spy = { all: calls, get: calls, run: calls, execute: calls } as unknown as Db;
    const page = await searchItems(spy, "   ", { locale: "en", offset: 0, size: 10 });
    expect(page).toEqual({ entries: [], hasNext: false });
    expect(calls).not.toHaveBeenCalled();
  });

  it("[SWHM2-C-0017] a two-keyword search matches either keyword, case-insensitive", async () => {
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
    const ids = async (q: string) =>
      (await searchItems(db, q, page)).entries.map((i) => i.itemId).sort();
    expect(await ids("pArRoT loudly")).toEqual(["I1", "I2"]);
    expect(await ids("PARROT cat-f")).toEqual(["I1", "I3", "I4"]);
  });

  it("treats % and _ in a keyword literally and pages results", async () => {
    await addCategory(db, "C1", "Cat");
    await addProduct(db, "P1", "C1", "Prod");
    for (const id of ["I1", "I2", "I3"]) await addItem(db, id, "P1", { descn: "swimmer" });
    expect((await searchItems(db, "%", { locale: "en", offset: 0, size: 5 })).entries).toEqual([]);
    const p = await searchItems(db, "swim", { locale: "en", offset: 0, size: 2 });
    expect([p.entries.length, p.hasNext]).toEqual([2, true]);
  });
});
