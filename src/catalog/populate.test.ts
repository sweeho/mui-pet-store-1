import { parseSample } from "./populate";

describe("parseSample", () => {
  it("reads categories, products and items with their parents", () => {
    const s = parseSample(`<catalog locale="en_US"><category id="C" name="A &amp; B">
      <product id="P" name="Prod" image="p.gif" descn="d"><!-- note -->
      <item id="I" listPrice="1.50" unitCost="1" image="i.gif" descn="x" attr1="a"/></product></category></catalog>`);
    expect(s.locale).toBe("en_US");
    expect(s.categories).toEqual([{ id: "C", name: "A & B" }]);
    expect(s.products[0]).toMatchObject({ id: "P", categoryId: "C" });
    expect(s.items[0]).toMatchObject({ productId: "P", listPrice: 1.5, unitCost: 1 });
    expect(s.items[0].attrs).toEqual(["a", null, null, null, null]);
  });
});
