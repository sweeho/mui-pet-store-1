import type { Exec } from "@/accounts/store";

/**
 * What the approval functions work on (design.md P3): the database, a clock and three in-memory
 * queues. The library functions only push onto the arrays; `dispatchApprovals` consumes them.
 */
export type ApprovalEnv = {
  db: Exec;
  now: () => Date;
  approvalQueue: string[];
  supplierQueue: string[];
  notifyList: string[];
  /** Who put the approval message on the queue; defaults to "auto". */
  origin?: "auto" | "admin";
};

export function newEnv(db: Exec, origin: "auto" | "admin" = "auto"): ApprovalEnv {
  return {
    db,
    now: () => new Date(),
    approvalQueue: [],
    supplierQueue: [],
    notifyList: [],
    origin,
  };
}
