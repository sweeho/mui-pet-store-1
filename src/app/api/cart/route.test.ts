/** @jest-environment node */
import { getDb } from "@/db/client";
import { getItemIds, getQuantity } from "@/cart/cart";
import { CART_COOKIE, loadCart } from "@/cart/store";

import { POST } from "./route";

function post(fields: Record<string, string>, cookie?: string) {
  const headers: Record<string, string> = {
    "content-type": "application/x-www-form-urlencoded",
  };
  if (cookie) headers.cookie = cookie;
  return POST(
    new Request("http://localhost/api/cart", {
      method: "POST",
      headers,
      body: new URLSearchParams(fields),
    }),
  );
}

const idOf = (res: Response) =>
  /pet_cart=([^;]+)/.exec(res.headers.get("set-cookie") ?? "")?.[1] as string;
const cartOf = async (id: string) => loadCart(await getDb(), id, Date.now());

describe("POST /api/cart", () => {
  it("[SWHM2-C-0071] add puts the item in the cart with quantity 1, sets the cookie and goes to /cart", async () => {
    const res = await post({ action: "add", itemId: "EST-1" });
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toMatch(/\/cart$/);
    const cookie = res.headers.get("set-cookie") ?? "";
    expect(cookie).toContain(`${CART_COOKIE}=`);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(getQuantity(await cartOf(idOf(res)), "EST-1")).toBe(1);
  });

  it("[SWHM2-C-0065] adding twice keeps one line", async () => {
    const first = await post({ action: "add", itemId: "EST-1" });
    const id = idOf(first);
    await post({ action: "add", itemId: "EST-1" }, `${CART_COOKIE}=${id}`);
    expect(getItemIds(await cartOf(id))).toEqual(["EST-1"]);
  });

  it("[SWHM2-C-0069] update sets each line's quantity", async () => {
    const id = idOf(await post({ action: "add", itemId: "EST-1" }));
    await post({ action: "add", itemId: "EST-2" }, `${CART_COOKIE}=${id}`);
    await post({ action: "update", "qty:EST-1": "7", "qty:EST-2": "3" }, `${CART_COOKIE}=${id}`);
    const cart = await cartOf(id);
    expect(getQuantity(cart, "EST-1")).toBe(7);
    expect(getQuantity(cart, "EST-2")).toBe(3);
  });

  it("[SWHM2-C-0066] update with a non-numeric quantity removes the line", async () => {
    const id = idOf(await post({ action: "add", itemId: "EST-1" }));
    await post({ action: "update", "qty:EST-1": "abc" }, `${CART_COOKIE}=${id}`);
    expect(getItemIds(await cartOf(id))).toEqual([]);
  });

  it("[SWHM2-C-0072] remove drops one line", async () => {
    const id = idOf(await post({ action: "add", itemId: "EST-1" }));
    await post({ action: "add", itemId: "EST-2" }, `${CART_COOKIE}=${id}`);
    await post({ action: "remove", itemId: "EST-1" }, `${CART_COOKIE}=${id}`);
    expect(getItemIds(await cartOf(id))).toEqual(["EST-2"]);
  });

  it("[SWHM2-C-0073] empty clears the cart", async () => {
    const id = idOf(await post({ action: "add", itemId: "EST-1" }));
    const res = await post({ action: "empty" }, `${CART_COOKIE}=${id}`);
    expect(res.status).toBe(303);
    expect(getItemIds(await cartOf(id))).toEqual([]);
  });

  it("an unknown action goes back to /cart and changes nothing", async () => {
    const res = await post({ action: "bogus" });
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toMatch(/\/cart$/);
  });
});
