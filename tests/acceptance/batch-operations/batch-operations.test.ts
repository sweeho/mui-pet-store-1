/** @jest-environment node */
import { mkdirSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { sql } from "drizzle-orm";

import { getDb } from "@/db/client";
import {
  runAgingReport,
  runBackup,
  runCatalogCheck,
  runChainStep,
  runHealthCheck,
  runLowStockReport,
  runOrderExtract,
  runOrderPurge,
} from "@/batch/jobs";
import { isInventoryPopulated, loadInventoryFile } from "@/batch/inventory";
import {
  HOUR,
  SUNDAY,
  WEDNESDAY,
  type Db,
  count,
  daysAgo,
  dropCatalogTables,
  filesIn,
  insertCatalogItem,
  insertOrder,
  makeEnv,
  readOutput,
  resetData,
  restoreCatalogTables,
  setStock,
  withBrokenOrderTable,
  ymd,
} from "./harness";

let db: Db;

beforeAll(async () => {
  db = await getDb();
  await restoreCatalogTables(db);
});

beforeEach(async () => {
  await resetData(db);
});

function xmlFile(items: Record<string, number>): string {
  const dir = join(tmpdir(), `inv-${process.pid}-${Math.random().toString(36).slice(2)}`);
  mkdirSync(dir, { recursive: true });
  const path = join(dir, "population.xml");
  const body = Object.entries(items)
    .map(([id, q]) => `<item id="${id}" quantity="${q}"/>`)
    .join("");
  writeFileSync(path, `<inventory-population>${body}</inventory-population>`);
  return path;
}

describe("backup", () => {
  // case: SWHM2-C-0078@v1
  test("SWHM2-C-0078 backup creates today's folder and prunes old ones", async () => {
    const t = await makeEnv(WEDNESDAY);
    const old = ymd(daysAgo(WEDNESDAY, 10));
    const recent = ymd(daysAgo(WEDNESDAY, 2));
    mkdirSync(join(t.backupDir, old), { recursive: true });
    mkdirSync(join(t.backupDir, recent), { recursive: true });

    const result = await runBackup(t.env);

    expect(result.exitCode).toBe(0);
    const folders = readdirSync(t.backupDir);
    expect(folders).toContain(ymd(WEDNESDAY));
    expect(folders).not.toContain(old);
    expect(folders).toContain(recent);
  });
});

describe("order extract", () => {
  // case: SWHM2-C-0079@v1
  test("SWHM2-C-0079 extract query failure exits 8 and notifies finance", async () => {
    const t = await makeEnv(WEDNESDAY);
    await insertOrder(db, { id: 1, time: daysAgo(WEDNESDAY, 1), status: "COMPLETED" });

    const result = await withBrokenOrderTable(db, () => runOrderExtract(t.env));

    expect(filesIn(t.outputDir, /^orders_\d{8}\.csv$/)).toHaveLength(0);
    expect(result.exitCode).toBe(8);
    expect(t.captured.notices.some((n) => n.channel === "finance")).toBe(true);
  });

  // case: SWHM2-C-0096@v1
  test("SWHM2-C-0096 extract file has ordered rows and trailer", async () => {
    const t = await makeEnv(WEDNESDAY);
    const yesterday = daysAgo(WEDNESDAY, 1);
    await insertOrder(db, { id: 30, time: yesterday, status: "COMPLETED", lines: 2 });
    await insertOrder(db, { id: 10, time: yesterday, status: "APPROVED" });
    await insertOrder(db, { id: 20, time: yesterday, status: "PENDING" });
    // Outside the window: two days ago, must not be exported.
    await insertOrder(db, { id: 5, time: daysAgo(WEDNESDAY, 2), status: "COMPLETED" });

    const result = await runOrderExtract(t.env);

    expect(result.exitCode).toBe(0);
    const text = readOutput(t.outputDir, /^orders_\d{8}\.csv$/);
    const lines = text.trim().split("\n");
    expect(lines).toHaveLength(4);
    expect(lines.slice(0, 3).map((l) => l.split(",")[0])).toEqual(["10", "20", "30"]);
    expect(lines[3]).toMatch(/^TRAILER,\d{8},3$/);
  });
});

describe("order aging report", () => {
  // case: SWHM2-C-0080@v1
  test("SWHM2-C-0080 stuck APPROVED order reported with exit 4", async () => {
    const t = await makeEnv(WEDNESDAY);
    await insertOrder(db, { id: 77, time: WEDNESDAY.getTime() - 30 * HOUR, status: "APPROVED" });

    const result = await runAgingReport(t.env);

    expect(result.exitCode).toBe(4);
    const report = readOutput(t.outputDir, /^order_aging_\d{8}\.txt$/);
    expect(report.split("\n").some((l) => l.includes("STUCK") && l.includes("77"))).toBe(true);
  });

  // case: SWHM2-C-0081@v1
  test("SWHM2-C-0081 aging report with nothing to report exits 0", async () => {
    const t = await makeEnv(WEDNESDAY);
    const result = await runAgingReport(t.env);
    expect(result.exitCode).toBe(0);
  });
});

describe("low-stock report", () => {
  // case: SWHM2-C-0082@v1
  test("SWHM2-C-0082 low-stock report lists only low item then totals", async () => {
    const t = await makeEnv(WEDNESDAY);
    await insertCatalogItem(db, { id: "EST-A" });
    await insertCatalogItem(db, { id: "EST-B" });
    await setStock(db, "EST-A", 120);
    await setStock(db, "EST-B", 900);

    const result = await runLowStockReport(t.env);

    expect(result.exitCode).toBe(0);
    const lines = readOutput(t.outputDir, /^inventory_\d{8}\.txt$/)
      .split("\n")
      .filter((l) => l.trim() !== "");
    expect(lines.some((l) => l.includes("EST-B"))).toBe(false);
    const aIdx = lines.findIndex((l) => l.includes("EST-A"));
    expect(aIdx).toBeGreaterThanOrEqual(0);
    const totals = lines[lines.length - 1];
    expect(lines.length - 1).toBeGreaterThan(aIdx);
    expect(totals).toMatch(/\b2\b/);
    expect(totals).toMatch(/1020/);
  });
});

describe("catalog check", () => {
  // case: SWHM2-C-0083@v1
  test("SWHM2-C-0083 item priced below cost raises C3", async () => {
    const t = await makeEnv(WEDNESDAY);
    await insertCatalogItem(db, { id: "EST-C", listPrice: 5, unitCost: 10 });

    const result = await runCatalogCheck(t.env);

    expect(result.exitCode).toBe(4);
    const output = [...t.captured.logs, readOutput(t.outputDir, /catalog/i)].join("\n");
    expect(output).toMatch(/C3/);
  });

  // case: SWHM2-C-0084@v1
  test("SWHM2-C-0084 missing catalog tables trigger non-forced load and re-check", async () => {
    await dropCatalogTables(db);
    try {
      const t = await makeEnv(WEDNESDAY, {
        requestCatalogLoad: async ({ force }) => {
          t.captured.loads.push({ force });
          await restoreCatalogTables(db);
        },
      });

      const result = await runCatalogCheck(t.env);

      expect(t.captured.loads).toEqual([{ force: false }]);
      // The checks ran against the freshly loaded (empty) catalog, so nothing is wrong.
      expect(result.exitCode).toBe(0);
    } finally {
      await restoreCatalogTables(db);
    }
  });

  // case: SWHM2-C-0085@v1
  test("SWHM2-C-0085 failed load request exits 8", async () => {
    await dropCatalogTables(db);
    try {
      const t = await makeEnv(WEDNESDAY, {
        requestCatalogLoad: async () => {
          throw new Error("load refused");
        },
      });
      const result = await runCatalogCheck(t.env);
      expect(result.exitCode).toBe(8);
    } finally {
      await restoreCatalogTables(db);
    }
  });
});

describe("health check", () => {
  // case: SWHM2-C-0086@v1
  test("SWHM2-C-0086 supplier page 503 fails health check", async () => {
    const t = await makeEnv(WEDNESDAY, {
      fetchPage: async (url: string) => ({ status: url.includes("supplier") ? 503 : 200 }),
    });

    const result = await runHealthCheck(t.env);

    expect(result.exitCode).toBe(8);
    expect(t.captured.logs.some((l) => /supplier/i.test(l) && /503/.test(l))).toBe(true);
  });
});

describe("job conventions", () => {
  // case: SWHM2-C-0087@v1
  test("SWHM2-C-0087 idle job logs start and end and exits 0", async () => {
    const t = await makeEnv(WEDNESDAY);

    const result = await runAgingReport(t.env);

    expect(result.exitCode).toBe(0);
    const logs = t.captured.logs;
    expect(logs.length).toBeGreaterThanOrEqual(2);
    expect(logs[0]).toMatch(/\d{4}-\d{2}-\d{2}/);
    expect(logs[0]).toMatch(/start/i);
    expect(logs[logs.length - 1]).toMatch(/\d{4}-\d{2}-\d{2}/);
    expect(logs[logs.length - 1]).toMatch(/end/i);
  });

  // case: SWHM2-C-0088@v1
  test("SWHM2-C-0088 batch indexes exist on purchase order columns", async () => {
    const indexes = await db.all<{ name: string }>(sql.raw("PRAGMA index_list(purchase_order)"));
    const indexed = new Set<string>();
    for (const ix of indexes) {
      const cols = await db.all<{ name: string }>(sql.raw(`PRAGMA index_info(${ix.name})`));
      if (cols[0]) indexed.add(cols[0].name);
    }
    expect(indexed.has("user_name")).toBe(true);
    expect(indexed.has("order_time")).toBe(true);
    expect(indexed.has("status")).toBe(true);
  });
});

describe("nightly chain", () => {
  // case: SWHM2-C-0089@v1
  test("SWHM2-C-0089 failed backup holds extract and notifies operations", async () => {
    const t = await makeEnv(WEDNESDAY);
    // A backup folder that cannot be created: its parent is a regular file.
    const blocker = join(t.outputDir, "blocker");
    mkdirSync(t.outputDir, { recursive: true });
    writeFileSync(blocker, "x");
    const failing = { ...t.env, backupDir: join(blocker, "backup") };
    await insertOrder(db, { id: 1, time: daysAgo(WEDNESDAY, 1), status: "COMPLETED" });

    const backup = await runBackup(failing);
    expect(backup.exitCode).toBe(8);

    const step = await runChainStep(failing, "01:30");

    expect(step.ran).toBe(false);
    expect(filesIn(t.outputDir, /^orders_\d{8}\.csv$/)).toHaveLength(0);
    expect(t.captured.notices.some((n) => n.channel === "operations")).toBe(true);
  });

  // case: SWHM2-C-0090@v1
  test("SWHM2-C-0090 purge does not run on a Wednesday", async () => {
    const wed = new Date(2026, 10, 18, 1, 30, 0);
    const t = await makeEnv(wed);
    expect((await runBackup(t.env)).exitCode).toBe(0);
    expect((await runChainStep(t.env, "01:30")).ran).toBe(true);
    await insertOrder(db, { id: 9, time: daysAgo(wed, 200), status: "COMPLETED" });

    const step = await runChainStep(
      { ...t.env, now: () => new Date(2026, 10, 18, 2, 0, 0) },
      "02:00",
    );

    expect(step.ran).toBe(false);
    expect(await count(db, "purchase_order", 9)).toBe(1);
  });
});

describe("inventory population", () => {
  // case: SWHM2-C-0091@v1
  test("SWHM2-C-0091 loading an item replaces its inventory record", async () => {
    const t = await makeEnv(WEDNESDAY);
    await setStock(db, "ITEM-X", 10);

    await loadInventoryFile(t.env, xmlFile({ "ITEM-X": 50 }));

    const rows = await db.all<{ quantity: number }>(
      sql`SELECT quantity FROM inventory WHERE item_id = 'ITEM-X'`,
    );
    expect(rows).toHaveLength(1);
    expect(Number(rows[0].quantity)).toBe(50);
  });

  // case: SWHM2-C-0092@v1
  test("SWHM2-C-0092 empty inventory reported as not populated", async () => {
    const t = await makeEnv(WEDNESDAY);
    expect(await isInventoryPopulated(t.env)).toBe(false);
  });

  // case: SWHM2-C-0097@v1
  test("SWHM2-C-0097 inventory file loads listed quantities", async () => {
    const t = await makeEnv(WEDNESDAY);

    await loadInventoryFile(t.env, xmlFile({ "ITEM-1": 7, "ITEM-2": 300 }));

    const rows = await db.all<{ item_id: string; quantity: number }>(
      sql`SELECT item_id, quantity FROM inventory ORDER BY item_id`,
    );
    expect(rows.map((r) => [r.item_id, Number(r.quantity)])).toEqual([
      ["ITEM-1", 7],
      ["ITEM-2", 300],
    ]);
    expect(await isInventoryPopulated(t.env)).toBe(true);
  });
});

describe("weekly purge", () => {
  async function sundayWithExtract() {
    const t = await makeEnv(SUNDAY);
    expect((await runOrderExtract(t.env)).exitCode).toBe(0);
    return t;
  }

  // case: SWHM2-C-0093@v1
  test("SWHM2-C-0093 Sunday purge deletes old COMPLETED order and dependents", async () => {
    const t = await sundayWithExtract();
    await insertOrder(db, { id: 100, time: daysAgo(SUNDAY, 200), status: "COMPLETED", lines: 2 });

    await runOrderPurge(t.env);

    expect(await count(db, "purchase_order", 100)).toBe(0);
    expect(await count(db, "order_line", 100)).toBe(0);
    expect(await count(db, "contact_info", 100)).toBe(0);
  });

  // case: SWHM2-C-0094@v1
  test("SWHM2-C-0094 purge keeps old PENDING and APPROVED orders", async () => {
    const t = await sundayWithExtract();
    await insertOrder(db, { id: 101, time: daysAgo(SUNDAY, 300), status: "PENDING" });
    await insertOrder(db, { id: 102, time: daysAgo(SUNDAY, 300), status: "APPROVED" });

    await runOrderPurge(t.env);

    expect(await count(db, "purchase_order", 101)).toBe(1);
    expect(await count(db, "purchase_order", 102)).toBe(1);
  });

  // case: SWHM2-C-0095@v1
  test("SWHM2-C-0095 purge skipped when extract failed", async () => {
    const t = await makeEnv(SUNDAY);
    await insertOrder(db, { id: 103, time: daysAgo(SUNDAY, 200), status: "COMPLETED" });
    const extract = await withBrokenOrderTable(db, () => runOrderExtract(t.env));
    expect(extract.exitCode).toBe(8);

    await runChainStep(t.env, "02:00");
    await runOrderPurge(t.env);

    expect(await count(db, "purchase_order", 103)).toBe(1);
    expect(await count(db, "order_line", 103)).toBe(1);
  });
});
