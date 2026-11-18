import { sql } from "drizzle-orm";

import type { Exec } from "./store";

/** True when the user name exists and the password equals the stored one exactly (R-0029). */
export async function authenticate(db: Exec, username: string, password: string): Promise<boolean> {
  const rows = (await db.all(sql`SELECT password FROM sign_on WHERE username = ${username}`)) as {
    password: string;
  }[];
  return rows.length === 1 && rows[0].password === password;
}
