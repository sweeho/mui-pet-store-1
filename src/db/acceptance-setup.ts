import { copyFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

/**
 * Jest setup for the acceptance run (design.md P10): each test file works on its own copy of the
 * database the global setup prepared. The locked suites reset whole tables, so files sharing one
 * database would delete each other's rows (and fail on each other's foreign keys).
 */
const template = (process.env.ACCEPTANCE_DB_TEMPLATE ??= process.env.DATABASE_PATH ?? "");
if (template) {
  const dir = mkdtempSync(join(tmpdir(), "app-acceptance-"));
  const own = join(dir, "test.db");
  copyFileSync(template, own);
  process.env.DATABASE_PATH = own;
  afterAll(() => {
    rmSync(dirname(own), { recursive: true, force: true });
  });
}
