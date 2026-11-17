/**
 * Shared fixture for the batch-operations acceptance tests. It is also the contract the build
 * must meet; every assumption about names lives here, not in the tests.
 *
 * Product modules (all under src/batch/):
 *  - jobs.ts: runBackup, runOrderExtract, runAgingReport, runLowStockReport, runCatalogCheck,
 *    runHealthCheck, runOrderPurge, runChainStep(env, "01:30" | "01:45" | "01:50" | "02:00").
 *    Jobs resolve to { exitCode: 0 | 4 | 8 }; runChainStep resolves to { ran: boolean, exitCode? }.
 *  - inventory.ts: loadInventoryFile(env, xmlPath), isInventoryPopulated(env).
 *  - env.ts: the BatchEnv type (shape built by makeEnv below). Job success is remembered in
 *    env.stateDir, so the chain and the purge can ask whether the backup/extract succeeded today.
 * Tables (SQLite, created by the Drizzle migrations): purchase_order(order_id, user_name,
 * order_time epoch ms, locale, total_price, status), order_line(order_id, line_num, item_id,
 * quantity), contact_info(order_id, email), inventory(item_id, quantity), and the catalog tables
 * category(category_id), product(product_id, category_id), item(item_id, product_id, list_price,
 * unit_cost), item_detail(item_id, locale, description).
 * Population file: <inventory-population><item id="X" quantity="50"/></inventory-population>.
 */
import { mkdtempSync, readdirSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { sql } from "drizzle-orm";

import { getDb } from "@/db/client";
import type { BatchEnv } from "@/batch/env";

export type Db = Awaited<ReturnType<typeof getDb>>;

export const HOUR = 3_600_000;
export const DAY = 24 * HOUR;
/** Wednesday 2026-11-18 01:30 local; the 15th of November 2026 is a Sunday. */
export const WEDNESDAY = new Date(2026, 10, 18, 1, 30, 0);
export const SUNDAY = new Date(2026, 10, 15, 2, 0, 0);

export function ymd(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
}

export function daysAgo(now: Date, n: number): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - n, 12, 0, 0);
}

export interface Captured {
  logs: string[];
  notices: { channel: string; message: string }[];
  loads: { force: boolean }[];
}

export interface TestEnv {
  env: BatchEnv;
  captured: Captured;
  backupDir: string;
  outputDir: string;
}

export async function makeEnv(now: Date, over: Partial<BatchEnv> = {}): Promise<TestEnv> {
  const root = mkdtempSync(join(tmpdir(), "batch-"));
  const captured: Captured = { logs: [], notices: [], loads: [] };
  const backupDir = join(root, "backup");
  const outputDir = join(root, "out");
  const env = {
    db: await getDb(),
    now: () => now,
    backupDir,
    outputDir,
    stateDir: join(root, "state"),
    log: (line: string) => captured.logs.push(line),
    notify: async (channel: string, message: string) => {
      captured.notices.push({ channel, message });
    },
    requestCatalogLoad: async ({ force }: { force: boolean }) => {
      captured.loads.push({ force });
    },
    healthUrls: [
      { name: "storefront", url: "http://app/store" },
      { name: "orders", url: "http://app/orders" },
      { name: "supplier", url: "http://app/supplier" },
      { name: "admin", url: "http://app/admin" },
    ],
    fetchPage: async () => ({ status: 200 }),
    ...over,
  } as BatchEnv;
  return { env, captured, backupDir, outputDir };
}

export async function resetData(db: Db): Promise<void> {
  for (const t of [
    "order_line",
    "contact_info",
    "purchase_order",
    "inventory",
    "item_detail",
    "item",
    "product",
    "category",
  ]) {
    await db.run(sql.raw(`DELETE FROM ${t}`));
  }
}

export async function insertOrder(
  db: Db,
  o: {
    id: number;
    time: Date | number;
    status: string;
    lines?: number;
    user?: string;
    total?: number;
  },
): Promise<void> {
  const time = typeof o.time === "number" ? o.time : o.time.getTime();
  await db.run(
    sql`INSERT INTO purchase_order (order_id, user_name, order_time, locale, total_price, status)
        VALUES (${o.id}, ${o.user ?? "j2ee"}, ${time}, 'en_US', ${o.total ?? 10}, ${o.status})`,
  );
  const lines = o.lines ?? 1;
  for (let i = 1; i <= lines; i++) {
    await db.run(
      sql`INSERT INTO order_line (order_id, line_num, item_id, quantity) VALUES (${o.id}, ${i}, 'EST-1', 1)`,
    );
  }
  await db.run(sql`INSERT INTO contact_info (order_id, email) VALUES (${o.id}, 'a@b.c')`);
}

export async function count(db: Db, table: string, orderId?: number): Promise<number> {
  const where = orderId === undefined ? "" : ` WHERE order_id = ${orderId}`;
  const rows = await db.all<{ n: number }>(sql.raw(`SELECT COUNT(*) AS n FROM ${table}${where}`));
  return Number(rows[0].n);
}

export async function insertCatalogItem(
  db: Db,
  i: { id: string; listPrice?: number; unitCost?: number },
): Promise<void> {
  await db.run(sql`INSERT OR IGNORE INTO category (category_id) VALUES ('CAT')`);
  await db.run(sql`INSERT OR IGNORE INTO product (product_id, category_id) VALUES ('PROD', 'CAT')`);
  await db.run(
    sql`INSERT INTO item (item_id, product_id, list_price, unit_cost)
        VALUES (${i.id}, 'PROD', ${i.listPrice ?? 20}, ${i.unitCost ?? 10})`,
  );
  await db.run(
    sql`INSERT INTO item_detail (item_id, locale, description) VALUES (${i.id}, 'en_US', ${"Desc " + i.id})`,
  );
}

export async function setStock(db: Db, itemId: string, quantity: number): Promise<void> {
  await db.run(sql`DELETE FROM inventory WHERE item_id = ${itemId}`);
  await db.run(sql`INSERT INTO inventory (item_id, quantity) VALUES (${itemId}, ${quantity})`);
}

const CATALOG_DDL = [
  "CREATE TABLE IF NOT EXISTS category (category_id TEXT PRIMARY KEY)",
  "CREATE TABLE IF NOT EXISTS product (product_id TEXT PRIMARY KEY, category_id TEXT)",
  "CREATE TABLE IF NOT EXISTS item (item_id TEXT PRIMARY KEY, product_id TEXT, list_price REAL, unit_cost REAL)",
  "CREATE TABLE IF NOT EXISTS item_detail (item_id TEXT, locale TEXT, description TEXT)",
];

export async function dropCatalogTables(db: Db): Promise<void> {
  for (const t of ["item_detail", "item", "product", "category"]) {
    await db.run(sql.raw(`DROP TABLE IF EXISTS ${t}`));
  }
}

/** Recreates the catalog tables, as a successful catalog load would. */
export async function restoreCatalogTables(db: Db): Promise<void> {
  for (const ddl of CATALOG_DDL) await db.run(sql.raw(ddl));
}

/** Makes the next query on purchase_order raise an error, then puts the table back. */
export async function withBrokenOrderTable<T>(db: Db, fn: () => Promise<T>): Promise<T> {
  await db.run(sql.raw("ALTER TABLE purchase_order RENAME TO purchase_order_broken"));
  try {
    return await fn();
  } finally {
    await db.run(sql.raw("ALTER TABLE purchase_order_broken RENAME TO purchase_order"));
  }
}

export function filesIn(dir: string, pattern: RegExp): string[] {
  return existsSync(dir) ? readdirSync(dir).filter((f) => pattern.test(f)) : [];
}

export function readOutput(dir: string, pattern: RegExp): string {
  const [f] = filesIn(dir, pattern);
  return f ? readFileSync(join(dir, f), "utf8") : "";
}
