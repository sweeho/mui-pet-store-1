import { randomUUID } from "node:crypto";

import { sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getDb } from "@/db/client";

import { type Cart, type Session, touchSession } from "./session";
import type { Exec } from "./store";

export const SESSION_COOKIE = "pet_session";

type Row = {
  username: string | null;
  signed_on: number;
  language: string;
  cart_language: string;
  last_access: number;
};

/**
 * The stored session for an id, with the idle rule applied at `now`: still active, its last access
 * is refreshed; ended, the row is deleted and there is no session (design.md P6, R-0160).
 */
export async function loadSession(db: Exec, id: string, now: number): Promise<Session | null> {
  const rows = (await db.all(
    sql`SELECT username, signed_on, language, cart_language, last_access
        FROM web_session WHERE session_id = ${id}`,
  )) as Row[];
  if (rows.length === 0) return null;
  const r = rows[0];
  const session: Session = {
    signedOn: Boolean(r.signed_on),
    username: r.username,
    language: r.language,
    lastAccess: r.last_access,
  };
  if (!touchSession(session, now)) {
    await deleteSession(db, id);
    return null;
  }
  await db.run(sql`UPDATE web_session SET last_access = ${now} WHERE session_id = ${id}`);
  return session;
}

/** Store a signed-on session and resolve the id for its cookie. */
export async function saveSession(db: Exec, session: Session, cart: Cart): Promise<string> {
  const id = randomUUID();
  await db.run(
    sql`INSERT INTO web_session (session_id, username, signed_on, language, cart_language, last_access)
        VALUES (${id}, ${session.username}, ${session.signedOn ? 1 : 0}, ${session.language},
                ${cart.language}, ${session.lastAccess})`,
  );
  return id;
}

export async function deleteSession(db: Exec, id: string): Promise<void> {
  await db.run(sql`DELETE FROM web_session WHERE session_id = ${id}`);
}

/** The signed-on session of this request, or null. Applies the 15-minute idle rule. */
export async function getWebSession(): Promise<Session | null> {
  const id = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!id) return null;
  const session = await loadSession(await getDb(), id, Date.now());
  return session?.signedOn ? session : null;
}

/**
 * The one way a page is protected (R-0162): the signed-on session, or a redirect to sign-on that
 * remembers `path` as returnTo.
 */
export async function requireSignOn(path: string): Promise<Session> {
  const session = await getWebSession();
  if (session) return session;
  return redirect(`/signon?returnTo=${encodeURIComponent(path)}`);
}
