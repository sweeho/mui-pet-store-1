import { randomUUID } from "node:crypto";

import { sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { Exec } from "@/accounts/store";
import { getDb } from "@/db/client";

import { parseCookies } from "../app/api/accounts/redirects";

export const ADMIN_COOKIE = "admin_session";

/** The administrator's credentials (design.md P5): the environment, else the locked specs' defaults. */
export function adminCredentials(): { user: string; password: string } {
  return {
    user: process.env.ADMIN_USER || "j2ee",
    password: process.env.ADMIN_PASSWORD || "j2ee",
  };
}

/** Start an administrator session; resolves its id (the value of the `admin_session` cookie). */
export async function createAdminSession(userName?: string): Promise<string> {
  const db = await getDb();
  const id = randomUUID();
  await db.run(
    sql`INSERT INTO admin_session (session_id, user_name, created_at)
        VALUES (${id}, ${userName ?? adminCredentials().user}, ${Date.now()})`,
  );
  return id;
}

export async function isAdminSession(db: Exec, id: string | undefined): Promise<boolean> {
  if (!id) return false;
  const rows = await db.all(sql`SELECT 1 FROM admin_session WHERE session_id = ${id}`);
  return rows.length > 0;
}

/** Whether a route request carries a valid administrator session. */
export async function hasAdminSession(request: Request): Promise<boolean> {
  const id = parseCookies(request.headers.get("cookie"))[ADMIN_COOKIE];
  return isAdminSession(await getDb(), id);
}

export const unauthorized = () =>
  Response.json({ error: "administrator sign-in required" }, { status: 401 });

/** Protect an admin page: redirects on the server to the admin sign-in. */
export async function requireAdmin(): Promise<void> {
  const id = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!(await isAdminSession(await getDb(), id))) redirect("/admin/login");
}
