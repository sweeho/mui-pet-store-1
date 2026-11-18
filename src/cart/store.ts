import type { Cart } from "./cart";
import type { Exec } from "@/accounts/store";

export const CART_COOKIE = "pet_cart";

export async function loadCart(_db: Exec, _id: string, _now: number): Promise<Cart> {
  throw new Error("VortexNotImplemented");
}
export async function saveCart(_db: Exec, _id: string, _cart: Cart, _now: number): Promise<void> {
  throw new Error("VortexNotImplemented");
}
