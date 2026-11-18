import { sql } from "drizzle-orm";

import type { Exec } from "@/accounts/store";

export type AddressInput = {
  street1: string;
  street2?: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
};

export type CardInput = { cardNumber: string; cardType: string; expiryDate: string };

/** Store an address; resolves its id. A missing required field rejects and leaves no row. */
export async function storeAddress(db: Exec, a: AddressInput): Promise<number> {
  const rows = (await db.all(
    sql`INSERT INTO address (street1, street2, city, state, zip, country)
        VALUES (${a.street1 ?? null}, ${a.street2 ?? null}, ${a.city ?? null}, ${a.state ?? null},
                ${a.zip ?? null}, ${a.country ?? null})
        RETURNING address_id AS id`,
  )) as { id: number | bigint }[];
  return Number(rows[0].id);
}

/** Store a credit card; resolves its id. A missing required field rejects and leaves no row. */
export async function storeCreditCard(db: Exec, c: CardInput): Promise<number> {
  const rows = (await db.all(
    sql`INSERT INTO credit_card (card_number, card_type, expiry_date)
        VALUES (${c.cardNumber ?? null}, ${c.cardType ?? null}, ${c.expiryDate ?? null})
        RETURNING card_id AS id`,
  )) as { id: number | bigint }[];
  return Number(rows[0].id);
}
