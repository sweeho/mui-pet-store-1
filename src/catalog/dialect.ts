import { type SQL, sql } from "drizzle-orm";

/**
 * The SQL of the catalog for one database variant (SWHM2-R-0009). Both sets are standard SQL apart
 * from the paging clause. Only "cloudscape" is written to run on this stack's SQLite; "oracle"
 * carries the Oracle wording and is never executed here.
 */
export type StatementSet = {
  readonly id: string;
  /** The paging clause for `size` rows after `offset` rows. */
  page(size: number, offset: number): SQL;
};

const sets: Record<string, StatementSet> = {
  cloudscape: Object.freeze({
    id: "cloudscape",
    page: (size, offset) => sql`LIMIT ${size} OFFSET ${offset}`,
  }),
  oracle: Object.freeze({
    id: "oracle",
    page: (size, offset) => sql`OFFSET ${offset} ROWS FETCH NEXT ${size} ROWS ONLY`,
  }),
};

/** The (memoised) statement set for a configured database identifier; unknown ids throw. */
export function statementsFor(id: string): StatementSet {
  const set = Object.hasOwn(sets, id) ? sets[id] : undefined;
  if (!set) throw new Error(`Unknown catalog database identifier "${id}"`);
  return set;
}

/** The set for the configured identifier (CATALOG_DATABASE_ID, default "cloudscape"). */
export function configuredStatements(): StatementSet {
  return statementsFor(process.env.CATALOG_DATABASE_ID ?? "cloudscape");
}
