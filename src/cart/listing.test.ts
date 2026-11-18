import { addItem, createCart } from "./cart";
import { type CatalogEntry, type CatalogLookup, listCart } from "./listing";

const A: CatalogEntry = {
  productId: "P-A",
  categoryId: "C-1",
  name: "Item A",
  attribute: "Large",
  listCost: 10.5,
};
const B: CatalogEntry = {
  productId: "P-B",
  categoryId: "C-2",
  name: "Item B",
  attribute: "Small",
  listCost: 3.25,
};

function lookup(
  entries: Record<string, CatalogEntry | Record<string, CatalogEntry>>,
  failing: string[] = [],
) {
  const calls: string[] = [];
  const fn: CatalogLookup = async (id, locale) => {
    calls.push(locale);
    if (failing.includes(id)) throw new Error(`lookup failed for ${id}`);
    const e = entries[id] as CatalogEntry & Record<string, CatalogEntry>;
    return e[locale] ?? e;
  };
  return { fn, calls };
}

describe("listCart", () => {
  it("[SWHM2-C-0064] computes line totals and the subtotal", async () => {
    const cart = createCart();
    addItem(cart, "A", 2);
    addItem(cart, "B", 1);
    const { lines, subtotal } = await listCart(cart, { catalog: lookup({ A, B }).fn });
    expect(lines.map((l) => l.total)).toEqual([21, 3.25]);
    expect(subtotal).toBe(24.25);
  });

  it("[SWHM2-C-0074] omits an item whose lookup fails, with no error", async () => {
    const cart = createCart();
    addItem(cart, "A", 2);
    addItem(cart, "B", 1);
    const { lines, subtotal } = await listCart(cart, { catalog: lookup({ A, B }, ["B"]).fn });
    expect(lines.map((l) => l.itemId)).toEqual(["A"]);
    expect(subtotal).toBe(21);
  });

  it("[SWHM2-C-0075] a line carries the catalog data and list cost as unit cost", async () => {
    const cart = createCart();
    addItem(cart, "A", 2);
    const { lines } = await listCart(cart, { catalog: lookup({ A }).fn });
    expect(lines).toEqual([
      {
        itemId: "A",
        productId: "P-A",
        categoryId: "C-1",
        name: "Item A",
        attribute: "Large",
        quantity: 2,
        unitCost: 10.5,
        total: 21,
      },
    ]);
  });

  it("[SWHM2-C-0076] without a locale the catalog is read in en_US", async () => {
    const cart = createCart();
    addItem(cart, "A", 1);
    const { fn, calls } = lookup({ A: { en_US: A, ja_JP: { ...A, name: "アイテム" } } });
    const { lines } = await listCart(cart, { catalog: fn });
    expect(calls).toEqual(["en_US"]);
    expect(lines[0].name).toBe("Item A");
  });

  it("[SWHM2-C-0076] a given locale is passed to the lookup", async () => {
    const cart = createCart();
    addItem(cart, "A", 1);
    const { fn } = lookup({ A: { en_US: A, ja_JP: { ...A, name: "アイテム" } } });
    const { lines } = await listCart(cart, { catalog: fn, locale: "ja_JP" });
    expect(lines[0].name).toBe("アイテム");
  });

  it("an empty cart lists nothing with a zero subtotal", async () => {
    expect(await listCart(createCart(), { catalog: lookup({}).fn })).toEqual({
      lines: [],
      subtotal: 0,
    });
  });
});
