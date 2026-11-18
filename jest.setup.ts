import { mkdtempSync } from "node:fs";
import { dirname, join } from "node:path";

import "@testing-library/jest-dom";

// Each test file gets its own database file (migrated and seeded on its first getDb()), inside the
// run's temporary folder that the global teardown removes. Test files run in parallel and many
// write and count rows, so a shared file made them see each other's rows.
if (process.env.DATABASE_PATH) {
  process.env.DATABASE_PATH = join(
    mkdtempSync(join(dirname(process.env.DATABASE_PATH), "file-")),
    "test.db",
  );
  delete process.env.APP_DATABASE_READY;
}

// A test file that used the database closes it, so no connection outlives the file. Jest runs a
// fast suite in its own process, where an open connection would keep it from exiting. The client
// registers the close (src/db/client.ts); a file that never touched the database has none.
afterAll(async () => {
  await (globalThis as { appDbClose?: () => Promise<void> }).appDbClose?.();
});
