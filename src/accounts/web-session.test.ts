/** @jest-environment node */
import { sql } from "drizzle-orm";

import { getDb } from "@/db/client";

import { useIsolatedDatabase } from "@/db/isolated";
import { createCart, createSession, IDLE_LIMIT_MS } from "./session";
import { deleteSession, loadSession, saveSession } from "./web-session";

jest.mock("next/headers", () => ({ cookies: jest.fn() }));
jest.mock("next/navigation", () => ({ redirect: jest.fn() }));

beforeAll(async () => {
  await useIsolatedDatabase();
});

const T0 = 1_700_000_000_000;

async function stored() {
  const db = await getDb();
  const session = {
    ...createSession({ language: "ja_JP" }),
    signedOn: true,
    username: "u1",
    lastAccess: T0,
  };
  return { db, id: await saveSession(db, session, createCart({ language: "ja_JP" })) };
}

describe("web session rows", () => {
  it("refreshes an active session", async () => {
    const { db, id } = await stored();
    const s = await loadSession(db, id, T0 + IDLE_LIMIT_MS - 1);
    expect(s).toMatchObject({ signedOn: true, username: "u1", language: "ja_JP" });
    const rows = (await db.all(
      sql`SELECT last_access FROM web_session WHERE session_id = ${id}`,
    )) as {
      last_access: number;
    }[];
    expect(rows[0].last_access).toBe(T0 + IDLE_LIMIT_MS - 1);
    await deleteSession(db, id);
  });

  it("ends and deletes a session idle for 15 minutes", async () => {
    const { db, id } = await stored();
    expect(await loadSession(db, id, T0 + IDLE_LIMIT_MS)).toBeNull();
    expect(await loadSession(db, id, T0)).toBeNull();
  });

  it("has no session for an unknown id", async () => {
    expect(await loadSession(await getDb(), "nope", T0)).toBeNull();
  });
});
