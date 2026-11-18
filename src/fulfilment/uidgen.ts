import { sql } from "drizzle-orm";

import type { TxEnv } from "./env";

/**
 * The next identifier of a named counter (design.md P8): the prefix and the counter's new value.
 * The counter row is created on first use. Needs no role. Checkout keeps its own `sequence` (SD7).
 */
export async function nextId(env: TxEnv, prefix: string): Promise<string> {
  if (env.counterCreation?.fail) throw new Error(`cannot create the counter "${prefix}"`);
  const rows = (await env.db.all(
    sql`INSERT INTO counter (name, value) VALUES (${prefix}, 1)
        ON CONFLICT(name) DO UPDATE SET value = value + 1 RETURNING value`,
  )) as { value: number }[];
  return `${prefix}${rows[0].value}`;
}
