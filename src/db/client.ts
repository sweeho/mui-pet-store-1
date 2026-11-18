import { createClient } from "@libsql/client";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";

import { populateCatalog } from "@/catalog/populate";

import { databaseUrl, prepareDatabase } from "./prepare";
import * as schema from "./schema";

// One connection per process, kept across hot reloads in development, and how to close it
// (the test setup closes it after each test file).
const closers = globalThis as unknown as {
  appDb?: Promise<Db>;
  appDbClose?: () => Promise<void>;
};

function connect(url: string) {
  // Wait up to 5 s for a lock another connection holds (parallel test workers and the dev server
  // share one file) instead of failing at once with SQLITE_BUSY.
  const client = createClient({ url, timeout: 5000 });
  closers.appDbClose = async () => {
    delete closers.appDb;
    client.close();
  };
  return surfaceStoreErrors(drizzle({ client, schema }));
}

/**
 * Drizzle wraps every store failure in a "Failed query: …" error and keeps the store's own
 * message (a constraint violation, a refused connection) on `cause`. The raw-statement methods
 * rethrow it with the store's message first, so a caller sees what the store said.
 */
function surfaceStoreErrors<D extends object>(db: D): D {
  const wrapped = new Set<string | symbol>(["run", "all", "get"]);
  return new Proxy(db, {
    get(target, prop, receiver) {
      const value: unknown = Reflect.get(target, prop, receiver);
      if (!wrapped.has(prop) || typeof value !== "function") return value;
      return async (...args: unknown[]) => {
        try {
          return await value.apply(target, args);
        } catch (e) {
          const cause = e instanceof Error ? e.cause : undefined;
          throw cause instanceof Error ? new Error(cause.message, { cause: e }) : e;
        }
      };
    },
  });
}

type Db = ReturnType<typeof connect>;

// Prepared once per process. The test run's global setup (test-setup.ts) prepares its own file
// before any test and says so through APP_DATABASE_READY, so parallel test workers never migrate
// the same file at once.
async function open(): Promise<Db> {
  const url = databaseUrl();
  if (!process.env.APP_DATABASE_READY) {
    await prepareDatabase(url);
    process.env.APP_DATABASE_READY = "1";
    // A new file also gets the sample catalog, so the storefront has items to show and to add to
    // the cart (the test run's own database is left as it is).
    const db = connect(url);
    if ((await db.all(sql`SELECT 1 FROM item LIMIT 1`)).length === 0) await populateCatalog(db);
    // Starting stock (design.md P10): every catalog item at 10000 when there is no inventory yet.
    // Batch operations loads the real inventory.
    if ((await db.all(sql`SELECT 1 FROM inventory LIMIT 1`)).length === 0) {
      await db.run(sql`INSERT INTO inventory (item_id, quantity) SELECT itemid, 10000 FROM item`);
    }
    return db;
  }
  return connect(url);
}

/** The database, migrated and seeded on first use. */
export function getDb(): Promise<Db> {
  // A failed open is not kept: the next request tries again, so a database that was not up yet
  // does not leave the server broken for good.
  closers.appDb ??= open().catch((err: unknown) => {
    delete closers.appDb;
    throw err;
  });
  return closers.appDb;
}
