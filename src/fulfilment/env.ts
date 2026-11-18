import type { Exec } from "@/accounts/store";
import type { getDb } from "@/db/client";

/** The database, or a transaction on it. */
export type Db = Awaited<ReturnType<typeof getDb>>;

/**
 * What the fulfilment functions work on (design.md P2): the database, a clock and in-memory
 * queues. The library functions only push onto the arrays; `dispatchFulfilment` records them.
 */
export type FulfilEnv = {
  db: Db;
  now: () => Date;
  supplierQueue: string[];
  completedOrderQueue: string[];
  invoiceQueue?: string[];
  /** Called with the id of each PENDING order an inventory update retries. */
  onReprocess?: (orderId: string) => unknown;
  /** Test hooks: force invoice generation or counter creation to fail. */
  invoiceGeneration?: { fail: boolean };
  counterCreation?: { fail: boolean };
  /** The caller's role. Never checked (R-0187, R-0182, R-0099). */
  callerRole?: string;
};

/** The same, on a transaction. */
export type TxEnv = Omit<FulfilEnv, "db"> & { db: Exec };

export function newFulfilEnv(db: Db): FulfilEnv {
  return {
    db,
    now: () => new Date(),
    supplierQueue: [],
    completedOrderQueue: [],
    invoiceQueue: [],
  };
}

/** Run `fn` in one transaction: it is all kept, or none of it (e.g. when an invoice fails). */
export function inTransaction<T>(env: FulfilEnv, fn: (tx: TxEnv) => Promise<T>): Promise<T> {
  return env.db.transaction((tx) => fn({ ...env, db: tx }));
}
