/** @jest-environment node */
import { sql } from "drizzle-orm";

import { useIsolatedDatabase } from "@/db/isolated";
import { getDb } from "@/db/client";

import { POST as signoff } from "./signoff/route";
import { POST as signon } from "./signon/route";
import { POST as users } from "./users/route";

const json = (body: unknown) =>
  new Request("http://x/api/accounts/users", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

const form = (path: string, fields: Record<string, string>, cookie?: string) =>
  new Request(`http://x${path}`, {
    method: "POST",
    headers: cookie ? { cookie } : {},
    body: new URLSearchParams(fields),
  });

beforeAll(async () => {
  await useIsolatedDatabase();
});

afterAll(async () => {
  const db = await getDb();
  for (const t of [
    "customer",
    "account",
    "profile",
    "contact",
    "sign_on",
    "credit_card",
    "address",
    "web_session",
  ]) {
    await db.run(sql.raw(`DELETE FROM ${t}`));
  }
});

describe("accounts routes", () => {
  it("creates a user from JSON with 201, then rejects a duplicate with a redirect", async () => {
    const ok = await users(json({ userId: "route1", password: "pw" }));
    expect(ok.status).toBe(201);
    expect(await ok.json()).toEqual({ userId: "route1" });
    const dup = await users(json({ userId: "route1", password: "pw" }));
    expect(dup.status).toBe(303);
    expect(dup.headers.get("location")).toMatch(/\/accounts\/create-error$/);
  });

  it("redirects an invalid user ID to the error page", async () => {
    const r = await users(json({ userId: "a*b", password: "pw" }));
    expect(r.headers.get("location")).toMatch(/\/accounts\/create-error$/);
  });

  it("records form preferences and redirects to sign-on", async () => {
    const r = await users(
      form("/api/accounts/users", {
        userId: "route2",
        password: "pw",
        language: "ja_JP",
        myList: "on",
      }),
    );
    expect(r.status).toBe(303);
    expect(r.headers.get("location")).toMatch(/\/signon$/);
    const rows = (await (
      await getDb()
    ).all(
      sql`SELECT p.language, p.my_list, p.banner FROM customer c JOIN profile p ON p.profile_id = c.profile_id WHERE c.user_id = 'route2'`,
    )) as { language: string; my_list: number; banner: number }[];
    expect(rows[0]).toEqual({ language: "ja_JP", my_list: 1, banner: 0 });
  });

  it("signs on, sets the session and remember cookies, and returns to the requested page", async () => {
    await users(json({ userId: "route3", password: "pw" }));
    const r = await signon(
      form("/api/accounts/signon", {
        username: "route3",
        password: "pw",
        remember: "on",
        returnTo: "/account",
      }),
    );
    expect(r.status).toBe(303);
    expect(r.headers.get("location")).toMatch(/\/account$/);
    const cookies = r.headers.getSetCookie();
    expect(cookies.some((c) => c.startsWith("pet_session=") && /HttpOnly/i.test(c))).toBe(true);
    expect(
      cookies.some((c) => c.startsWith("remember_user=route3") && /Max-Age=2678400/.test(c)),
    ).toBe(true);
  });

  it("sends a failed sign-on to the error page and an outside returnTo home", async () => {
    const bad = await signon(
      form("/api/accounts/signon", { username: "route3", password: "x", returnTo: "/account" }),
    );
    expect(bad.headers.get("location")).toMatch(/\/signon\/error\?returnTo=%2Faccount$/);
    const ok = await signon(
      form("/api/accounts/signon", {
        username: "route3",
        password: "pw",
        returnTo: "//evil.example",
      }),
    );
    expect(ok.headers.get("location")).toMatch(/\/$/);
  });

  it("signs off: deletes the session row and expires the cookie", async () => {
    const ok = await signon(form("/api/accounts/signon", { username: "route3", password: "pw" }));
    const id = /pet_session=([^;]+)/.exec(ok.headers.getSetCookie()[0])![1];
    const out = await signoff(form("/api/accounts/signoff", {}, `pet_session=${id}`));
    expect(out.status).toBe(303);
    expect(out.headers.getSetCookie()[0]).toMatch(/Max-Age=0/);
    const rows = (await (
      await getDb()
    ).all(sql`SELECT 1 FROM web_session WHERE session_id = ${id}`)) as unknown[];
    expect(rows).toHaveLength(0);
  });
});
