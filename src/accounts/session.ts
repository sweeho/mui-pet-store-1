import { sql } from "drizzle-orm";

import { authenticate } from "./signon";
import type { Exec } from "./store";

export const REMEMBER_COOKIE = "remember_user";
export const REMEMBER_SECONDS = 2_678_400;
export const IDLE_LIMIT_MS = 15 * 60_000;
export const SIGNON_ERROR_PAGE = "/signon/error";
export const DEFAULT_LANGUAGE = "en_US";

export type Session = {
  signedOn: boolean;
  username: string | null;
  language: string;
  lastAccess: number;
};
export type Cart = { language: string };

export function createSession({ language }: { language: string }): Session {
  return { signedOn: false, username: null, language, lastAccess: Date.now() };
}

export function createCart({ language }: { language: string }): Cart {
  return { language };
}

/** A same-site path to go to after sign-on; anything else goes home. */
export function safeReturnTo(returnTo: string | null | undefined): string {
  return returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/";
}

const cookieHeader = (value: string, maxAge: number) =>
  `${REMEMBER_COOKIE}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;

/**
 * Authenticate, then mark the session signed on, apply the customer's language to the session
 * and cart, and say which remember-name cookie to set (R-0029, R-0067, R-0068, R-0163).
 */
export async function signOn(
  db: Exec,
  req: {
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
  if (!(await authenticate(db, req.username, req.password))) {
    return { ok: false, redirect: SIGNON_ERROR_PAGE, setCookies: [] };
  }
  const { session, cart } = req;
  session.signedOn = true;
  session.username = req.username;
  session.lastAccess = req.now ?? Date.now();
  const rows = (await db.all(
    sql`SELECT p.language FROM customer c JOIN profile p ON p.profile_id = c.profile_id
        WHERE c.user_id = ${req.username}`,
  )) as { language: string }[];
  if (rows.length === 1) {
    session.language = rows[0].language;
    cart.language = rows[0].language;
  }
  const setCookies: string[] = [];
  if (req.remember) setCookies.push(cookieHeader(req.username, REMEMBER_SECONDS));
  else if (REMEMBER_COOKIE in req.cookies) setCookies.push(cookieHeader("", 0));
  return { ok: true, redirect: safeReturnTo(req.returnTo), setCookies };
}

/** Apply the idle rule: ended once 15 minutes have passed, otherwise refreshed (R-0160). */
export function touchSession(session: Session, now: number): boolean {
  if (now - session.lastAccess >= IDLE_LIMIT_MS) {
    session.signedOn = false;
    session.username = null;
    return false;
  }
  session.lastAccess = now;
  return true;
}
