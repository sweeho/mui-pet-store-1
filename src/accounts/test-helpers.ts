import { sql } from "drizzle-orm";

import type { Db } from "./types";

export type { Db };
export const REMEMBER_COOKIE = "remember_user";
export const ERROR_PAGE = "/accounts/create-error";

const TABLES = ["customer", "account", "profile", "contact", "sign_on", "credit_card", "address"];

/** Empty the account tables (a table that does not exist yet is skipped). */
export async function resetData(db: Db): Promise<void> {
  for (const t of TABLES) {
    try {
      await db.run(sql.raw(`DELETE FROM ${t}`));
    } catch {
      // not migrated yet
    }
  }
}

export async function count(db: Db, table: string): Promise<number> {
  const rows = (await db.all(sql.raw(`SELECT COUNT(*) AS n FROM ${table}`))) as { n: number }[];
  return Number(rows[0].n);
}

export const ADDRESS = {
  street1: "1 Main St",
  city: "Springfield",
  state: "CA",
  zip: "90000",
  country: "US",
};
export const CARD = { cardNumber: "4111111111111111", cardType: "Visa", expiryDate: "04/2008" };
export const PERSON = {
  familyName: "Lee",
  givenName: "Ann",
  telephone: "555-0100",
  email: "ann@example.com",
};
