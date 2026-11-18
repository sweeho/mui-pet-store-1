import { randomUUID } from "node:crypto";

import { addItem, emptyCart, removeItem, updateQuantity } from "@/cart/cart";
import { CART_COOKIE, loadCart, saveCart } from "@/cart/store";
import { getDb } from "@/db/client";

import { parseCookies, seeOther } from "../accounts/redirects";

const QTY_PREFIX = "qty:";

const field = (form: FormData, name: string) => {
  const v = form.get(name);
  return typeof v === "string" ? v : "";
};

/**
 * POST /api/cart: the cart forms (design.md P4). `action` is add, update, remove or empty; the
 * answer is always a 303 to /cart. The random cart id is set in a cookie on the first write.
 */
export async function POST(request: Request): Promise<Response> {
  const form = await request.formData();
  const action = field(form, "action");
  const existing = parseCookies(request.headers.get("cookie"))[CART_COOKIE];
  const id = existing || (action === "add" ? randomUUID() : "");
  if (!id) return seeOther("/cart");

  const db = await getDb();
  const now = Date.now();
  const cart = await loadCart(db, id, now);
  const itemId = field(form, "itemId");
  if (action === "add" && itemId) {
    const raw = field(form, "quantity").trim();
    addItem(cart, itemId, /^\d+$/.test(raw) && Number(raw) > 0 ? Number(raw) : undefined);
  } else if (action === "update") {
    for (const [name, value] of form.entries()) {
      if (name.startsWith(QTY_PREFIX) && typeof value === "string") {
        updateQuantity(cart, name.slice(QTY_PREFIX.length), value);
      }
    }
  } else if (action === "remove") removeItem(cart, itemId);
  else if (action === "empty") emptyCart(cart);
  await saveCart(db, id, cart, now);

  const cookie = `${CART_COOKIE}=${id}; Path=/; HttpOnly; SameSite=Lax`;
  return seeOther("/cart", existing ? [] : [cookie]);
}
