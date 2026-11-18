import { sql } from "drizzle-orm";

import type { Db } from "@/accounts/store";

/** The counter of a sequence, or undefined when it does not exist yet. */
export async function getCounter(db: Pick<Db, "all">, name: string): Promise<number | undefined> {
  const rows = (await db.all(sql`SELECT counter FROM sequence WHERE name = ${name}`)) as {
    counter: number | bigint;
  }[];
  return rows.length === 0 ? undefined : Number(rows[0].counter);
}

/**
 * The next identifier of a sequence: its name followed by the incremented counter. A new sequence
 * starts at 0, so its first identifier is name + "1". Runs in one transaction.
 */
export async function nextIdentifier(db: Db, name: string): Promise<string> {
  return db.transaction(async (tx) => {
    await tx.run(
      sql`INSERT INTO sequence (name, counter) VALUES (${name}, 0) ON CONFLICT(name) DO NOTHING`,
    );
    const rows = (await tx.all(
      sql`UPDATE sequence SET counter = counter + 1 WHERE name = ${name} RETURNING counter`,
    )) as { counter: number | bigint }[];
    return `${name}${Number(rows[0].counter)}`;
  });
}
