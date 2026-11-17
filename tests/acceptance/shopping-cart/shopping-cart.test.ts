/** @jest-environment node */
import {
  addItem,
  createCart,
  emptyCart,
  getItemCount,
  getItemIds,
  getQuantity,
  removeItem,
  updateQuantity,
} from "@/cart/cart";
import { listCart } from "@/cart/listing";
import { A, B, catalogOf } from "./harness";

function cartWith(items: Record<string, number>) {
  const cart = createCart();
  for (const [id, q] of Object.entries(items)) addItem(cart, id, q);
  return cart;
}

describe("shopping-cart", () => {
  // case: SWHM2-C-0064@v1
  it("SWHM2-C-0064 line totals and subtotal are computed", async () => {
    const cart = cartWith({ A: 2, B: 1 });
    const { lines, subtotal } = await listCart(cart, { catalog: catalogOf({ A, B }) });
    const byId = Object.fromEntries(lines.map((l) => [l.itemId, l]));
    expect(byId.A.total).toBeCloseTo(21.0, 10);
    expect(byId.B.total).toBeCloseTo(3.25, 10);
    expect(subtotal).toBeCloseTo(24.25, 10);
  });

  // case: SWHM2-C-0065@v1
  it("SWHM2-C-0065 adding the same item twice keeps one line", () => {
    const cart = cartWith({ A: 1 });
    addItem(cart, "A");
    expect(getItemIds(cart).filter((i) => i === "A")).toHaveLength(1);
    expect(getItemIds(cart)).toHaveLength(1);
  });

  // case: SWHM2-C-0066@v1
  it("SWHM2-C-0066 a non-numeric quantity removes the item", () => {
    const cart = cartWith({ A: 2 });
    updateQuantity(cart, "A", "abc");
    expect(getItemIds(cart)).not.toContain("A");
    expect(getQuantity(cart, "A")).toBeUndefined();
  });

  // case: SWHM2-C-0067@v1
  it("SWHM2-C-0067 item count is the number of distinct lines", () => {
    expect(getItemCount(cartWith({ A: 3, B: 2 }))).toBe(2);
  });

  // case: SWHM2-C-0068@v1
  it("SWHM2-C-0068 updating quantity to 0 removes the item", () => {
    const cart = cartWith({ A: 3 });
    updateQuantity(cart, "A", 0);
    expect(getItemIds(cart)).not.toContain("A");
  });

  // case: SWHM2-C-0069@v1
  it("SWHM2-C-0069 updating quantity to 7 sets the quantity", () => {
    const cart = cartWith({ A: 3 });
    updateQuantity(cart, "A", 7);
    expect(getQuantity(cart, "A")).toBe(7);
  });

  // case: SWHM2-C-0070@v1
  it("SWHM2-C-0070 re-adding replaces the quantity", () => {
    const cart = cartWith({ A: 2 });
    addItem(cart, "A", 5);
    expect(getQuantity(cart, "A")).toBe(5);
  });

  // case: SWHM2-C-0071@v1
  it("SWHM2-C-0071 adding without a quantity defaults to 1", () => {
    const cart = createCart();
    addItem(cart, "A");
    expect(getQuantity(cart, "A")).toBe(1);
  });

  // case: SWHM2-C-0072@v1
  it("SWHM2-C-0072 removing one item leaves the other", () => {
    const cart = cartWith({ A: 1, B: 1 });
    removeItem(cart, "A");
    expect(getItemIds(cart)).toEqual(["B"]);
  });

  // case: SWHM2-C-0073@v1
  it("SWHM2-C-0073 emptying the cart clears all items", () => {
    const cart = cartWith({ A: 1, B: 1 });
    emptyCart(cart);
    expect(getItemIds(cart)).toEqual([]);
    expect(getItemCount(cart)).toBe(0);
  });

  // case: SWHM2-C-0074@v1
  it("SWHM2-C-0074 a failed catalog lookup omits the item without an error", async () => {
    const cart = cartWith({ A: 2, B: 1 });
    const { lines, subtotal } = await listCart(cart, { catalog: catalogOf({ A, B }, ["B"]) });
    expect(lines.map((l) => l.itemId)).toEqual(["A"]);
    expect(subtotal).toBeCloseTo(21.0, 10);
  });

  // case: SWHM2-C-0075@v1
  it("SWHM2-C-0075 a cart line shows catalog data", async () => {
    const cart = cartWith({ A: 2 });
    const { lines } = await listCart(cart, { catalog: catalogOf({ A }), locale: "en_US" });
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({
      itemId: "A",
      productId: A.productId,
      categoryId: A.categoryId,
      name: A.name,
      attribute: A.attribute,
      quantity: 2,
      unitCost: A.listCost,
    });
  });

  // case: SWHM2-C-0076@v1
  it("SWHM2-C-0076 no locale falls back to US English", async () => {
    const cart = cartWith({ A: 1 });
    const catalog = catalogOf({
      A: {
        en_US: { ...A, name: "Item A (US)" },
        fr_FR: { ...A, name: "Article A (FR)" },
      },
    });
    const { lines } = await listCart(cart, { catalog });
    expect(lines[0].name).toBe("Item A (US)");
  });
});
