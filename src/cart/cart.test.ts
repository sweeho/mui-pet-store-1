import {
  addItem,
  createCart,
  emptyCart,
  getItemCount,
  getItemIds,
  getQuantity,
  removeItem,
  updateQuantity,
} from "./cart";

function cartWith(entries: Record<string, number>) {
  const cart = createCart();
  for (const [id, q] of Object.entries(entries)) addItem(cart, id, q);
  return cart;
}

describe("cart model", () => {
  it("[SWHM2-C-0065] adding the same item twice keeps one line", () => {
    const cart = cartWith({ A: 1 });
    addItem(cart, "A");
    expect(getItemIds(cart)).toEqual(["A"]);
  });

  it("[SWHM2-C-0070] re-adding replaces the quantity", () => {
    const cart = cartWith({ A: 2 });
    addItem(cart, "A", 5);
    expect(getQuantity(cart, "A")).toBe(5);
  });

  it("[SWHM2-C-0071] add without quantity defaults to 1", () => {
    const cart = createCart();
    addItem(cart, "A");
    expect(getQuantity(cart, "A")).toBe(1);
  });

  it("[SWHM2-C-0068] updating the quantity to 0 removes the item", () => {
    const cart = cartWith({ A: 3 });
    updateQuantity(cart, "A", 0);
    expect(getQuantity(cart, "A")).toBeUndefined();
    expect(getItemIds(cart)).toEqual([]);
  });

  it("[SWHM2-C-0068] a negative quantity also removes the item", () => {
    const cart = cartWith({ A: 3 });
    updateQuantity(cart, "A", -2);
    expect(getItemIds(cart)).toEqual([]);
  });

  it("[SWHM2-C-0069] updating the quantity to 7 sets it", () => {
    const cart = cartWith({ A: 3 });
    updateQuantity(cart, "A", 7);
    expect(getQuantity(cart, "A")).toBe(7);
  });

  it("[SWHM2-C-0069] a numeric string sets the quantity", () => {
    const cart = cartWith({ A: 3 });
    updateQuantity(cart, "A", "4");
    expect(getQuantity(cart, "A")).toBe(4);
  });

  it("[SWHM2-C-0066] a non-numeric quantity removes the item", () => {
    const cart = cartWith({ A: 3 });
    updateQuantity(cart, "A", "abc");
    expect(getQuantity(cart, "A")).toBeUndefined();
  });

  it("[SWHM2-C-0066] a fractional or blank quantity counts as 0", () => {
    const cart = cartWith({ A: 3, B: 2 });
    updateQuantity(cart, "A", "2.5");
    updateQuantity(cart, "B", "");
    expect(getItemIds(cart)).toEqual([]);
  });

  it("[SWHM2-C-0067] the item count is the number of distinct lines", () => {
    expect(getItemCount(cartWith({ A: 3, B: 2 }))).toBe(2);
  });

  it("[SWHM2-C-0072] removing one item leaves the other", () => {
    const cart = cartWith({ A: 1, B: 1 });
    removeItem(cart, "A");
    expect(getItemIds(cart)).toEqual(["B"]);
  });

  it("[SWHM2-C-0073] emptying the cart clears all items", () => {
    const cart = cartWith({ A: 1, B: 1 });
    emptyCart(cart);
    expect(getItemIds(cart)).toEqual([]);
    expect(getItemCount(cart)).toBe(0);
  });

  it("lists items in insertion order", () => {
    expect(getItemIds(cartWith({ B: 1, A: 1 }))).toEqual(["B", "A"]);
  });
});
