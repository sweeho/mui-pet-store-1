import type { Exec } from "./store";

export const REMEMBER_COOKIE = "remember_user";
export const IDLE_LIMIT_MS = 15 * 60_000;

export type Session = {
  signedOn: boolean;
  username: string | null;
  language: string;
  lastAccess: number;
};
export type Cart = { language: string };

export function createSession(_init: { language: string }): Session {
  throw new Error("VortexNotImplemented");
}

export function createCart(_init: { language: string }): Cart {
  throw new Error("VortexNotImplemented");
}

export async function signOn(
  _db: Exec,
  _req: {
    username: string;
    password: string;
    remember: boolean;
    cookies: Record<string, string>;
    session: Session;
    cart: Cart;
    now?: number;
    returnTo?: string | null;
  },
): Promise<{ ok: boolean; redirect: string; setCookies: string[] }> {
  throw new Error("VortexNotImplemented");
}

export function touchSession(_session: Session, _now: number): boolean {
  throw new Error("VortexNotImplemented");
}
