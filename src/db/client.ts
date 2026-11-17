import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import { databaseUrl, prepareDatabase } from "./prepare";
import * as schema from "./schema";

// One connection per process, kept across hot reloads in development, and how to close it
// (the test setup closes it after each test file).
const closers = globalThis as unknown as {
  appDb?: Promise<Db>;
  appDbClose?: () => Promise<void>;
};

function connect(url: string) {
  const client = createClient({ url });
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
