/** @jest-environment node */
import { IDLE_LIMIT_MS } from "@/accounts/session";
import { getDb } from "@/db/client";

import { addItem, createCart, getItemIds, getQuantity } from "./cart";
import { loadCart, saveCart } from "./store";

describe("cart store", () => {
  it("[SWHM2-C-0065] saves and loads a cart by id", async () => {
    const db = await getDb();
    const cart = createCart();
    addItem(cart, "EST-1", 2);
    await saveCart(db, "id-1", cart, 1000);
    const loaded = await loadCart(db, "id-1", 2000);
    expect(getItemIds(loaded)).toEqual(["EST-1"]);
    expect(getQuantity(loaded, "EST-1")).toBe(2);
  });

  it("an unknown id loads an empty cart", async () => {
    const db = await getDb();
    expect(getItemIds(await loadCart(db, "nobody", 1000))).toEqual([]);
  });

  it("a cart idle for 15 minutes is empty and its row is gone", async () => {
    const db = await getDb();
    const cart = createCart();
    addItem(cart, "EST-1", 1);
    await saveCart(db, "id-2", cart, 1000);
    expect(getItemIds(await loadCart(db, "id-2", 1000 + IDLE_LIMIT_MS))).toEqual([]);
    expect(getItemIds(await loadCart(db, "id-2", 1000 + IDLE_LIMIT_MS + 1))).toEqual([]);
  });

  it("a read refreshes the idle clock", async () => {
    const db = await getDb();
    const cart = createCart();
    addItem(cart, "EST-1", 1);
    await saveCart(db, "id-3", cart, 0);
    await loadCart(db, "id-3", IDLE_LIMIT_MS - 1);
    expect(getItemIds(await loadCart(db, "id-3", 2 * IDLE_LIMIT_MS - 2))).toEqual(["EST-1"]);
  });
});
