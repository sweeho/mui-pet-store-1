import { sql } from "drizzle-orm";
import { cookies } from "next/headers";

import { IDLE_LIMIT_MS } from "@/accounts/session";
import type { Exec } from "@/accounts/store";
import { getDb } from "@/db/client";

import { type Cart, createCart } from "./cart";

export const CART_COOKIE = "pet_cart";

/**
 * The stored cart for an id, with the idle rule applied at `now` (design.md P3): idle for 15
 * minutes, the row is deleted and the cart is empty; otherwise its last access is refreshed.
 */
export async function loadCart(db: Exec, id: string, now: number): Promise<Cart> {
  const rows = (await db.all(
    sql`SELECT contents, last_access FROM shopping_cart WHERE cart_id = ${id}`,
  )) as { contents: string; last_access: number }[];
  if (rows.length === 0) return createCart();
  if (now - rows[0].last_access >= IDLE_LIMIT_MS) {
    await db.run(sql`DELETE FROM shopping_cart WHERE cart_id = ${id}`);
    return createCart();
  }
  await db.run(sql`UPDATE shopping_cart SET last_access = ${now} WHERE cart_id = ${id}`);
  return new Map(Object.entries(JSON.parse(rows[0].contents) as Record<string, number>));
}

export async function saveCart(db: Exec, id: string, cart: Cart, now: number): Promise<void> {
  const contents = JSON.stringify(Object.fromEntries(cart));
  await db.run(
    sql`INSERT INTO shopping_cart (cart_id, contents, last_access) VALUES (${id}, ${contents}, ${now})
        ON CONFLICT(cart_id) DO UPDATE SET contents = excluded.contents, last_access = excluded.last_access`,
  );
}

/** The cart of this request's visit (empty when there is none yet). */
export async function getRequestCart(): Promise<Cart> {
  const id = (await cookies()).get(CART_COOKIE)?.value;
  if (!id) return createCart();
  return loadCart(await getDb(), id, Date.now());
}
