import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { getDb } from "@/db/client";

/**
 * Open this test file's own migrated SQLite database, so its writes never meet the shared test
 * database that other files (running in parallel) count rows in. The connection is cached by
 * getDb(), so route handlers under test use it too.
 */
export async function useIsolatedDatabase() {
  const saved = { path: process.env.DATABASE_PATH, ready: process.env.APP_DATABASE_READY };
  process.env.DATABASE_PATH = join(mkdtempSync(join(tmpdir(), "app-iso-")), "test.db");
  delete process.env.APP_DATABASE_READY;
  try {
    return await getDb();
  } finally {
    for (const [key, value] of [
      ["DATABASE_PATH", saved.path],
      ["APP_DATABASE_READY", saved.ready],
    ] as const) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}
