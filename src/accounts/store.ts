import { sql } from "drizzle-orm";

import type { getDb } from "@/db/client";

export type Db = Awaited<ReturnType<typeof getDb>>;
/** What the stores need: the database or a transaction on it. */
export type Exec = Pick<Db, "run" | "all">;

export type Preferences = {
  language: string;
  favoriteCategory: string | null;
  myList: boolean;
  banner: boolean;
};

export type Address = {
  street1: string;
  street2?: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
};

export type ContactInput = {
  familyName: string;
  givenName: string;
  telephone: string;
  email: string;
  address: Address;
};

export type CardDetails = { cardNumber: string; cardType: string; expiryDate: string };

export type AccountView = {
  status: string;
  contact: {
    familyName: string;
    givenName: string;
    telephone: string;
    email: string;
    address: Address;
  };
  card: CardDetails;
};

type IdRow = { id: number | bigint };

async function insertReturningId(db: Exec, statement: ReturnType<typeof sql>): Promise<number> {
  const rows = (await db.all(statement)) as IdRow[];
  return Number(rows[0].id);
}

/** Store a contact. A missing required field, or an address that does not exist, rejects. */
export async function storeContact(
  db: Exec,
  c: {
    familyName: string;
    givenName: string;
    telephone: string;
    email: string;
    addressId: number;
  },
): Promise<number> {
  return insertReturningId(
    db,
    sql`INSERT INTO contact (family_name, given_name, telephone, email, address_id)
        VALUES (${c.familyName ?? null}, ${c.givenName ?? null}, ${c.telephone ?? null},
                ${c.email ?? null}, ${c.addressId ?? null})
        RETURNING contact_id AS id`,
  );
}

/** Store an account. Its contact and card must exist; its status is active or disabled. */
export async function storeAccount(
  db: Exec,
  a: { status: string; contactId: number; cardId: number },
): Promise<number> {
  return insertReturningId(
    db,
    sql`INSERT INTO account (status, contact_id, card_id)
        VALUES (${a.status ?? null}, ${a.contactId ?? null}, ${a.cardId ?? null})
        RETURNING account_id AS id`,
  );
}

/** Store a profile. The language is required; the favourite category is optional. */
export async function storeProfile(
  db: Exec,
  p: { language: string; favoriteCategory?: string | null; myList: boolean; banner: boolean },
): Promise<number> {
  return insertReturningId(
    db,
    sql`INSERT INTO profile (language, favorite_category, my_list, banner)
        VALUES (${p.language ?? null}, ${p.favoriteCategory ?? null}, ${p.myList ? 1 : 0},
                ${p.banner ? 1 : 0})
        RETURNING profile_id AS id`,
  );
}

/** Store a sign-on credential. The password is kept exactly as supplied (R-0161). */
export async function storeSignOn(
  db: Exec,
  s: { username: string; password: string },
): Promise<void> {
  await db.run(
    sql`INSERT INTO sign_on (username, password) VALUES (${s.username ?? null}, ${s.password ?? null})`,
  );
}

/** Store a customer keyed by its sign-on user name; each user name has at most one. */
export async function storeCustomer(
  db: Exec,
  c: { userId: string; accountId: number; profileId: number },
): Promise<string> {
  await db.run(
    sql`INSERT INTO customer (user_id, account_id, profile_id)
        VALUES (${c.userId ?? null}, ${c.accountId ?? null}, ${c.profileId ?? null})`,
  );
  return c.userId;
}

export async function getProfile(db: Exec, profileId: number): Promise<Preferences> {
  const rows = (await db.all(
    sql`SELECT language, favorite_category, my_list, banner FROM profile WHERE profile_id = ${profileId}`,
  )) as {
    language: string;
    favorite_category: string | null;
    my_list: number;
    banner: number;
  }[];
  if (rows.length === 0) throw new Error(`No profile ${profileId}`);
  const r = rows[0];
  return {
    language: r.language,
    favoriteCategory: r.favorite_category,
    myList: Boolean(r.my_list),
    banner: Boolean(r.banner),
  };
}

export async function getAccount(db: Exec, accountId: number): Promise<AccountView> {
  const rows = (await db.all(
    sql`SELECT a.status, c.family_name, c.given_name, c.telephone, c.email,
               d.street1, d.street2, d.city, d.state, d.zip, d.country,
               k.card_number, k.card_type, k.expiry_date
        FROM account a
        JOIN contact c ON c.contact_id = a.contact_id
        JOIN address d ON d.address_id = c.address_id
        JOIN credit_card k ON k.card_id = a.card_id
        WHERE a.account_id = ${accountId}`,
  )) as Record<string, string | null>[];
  if (rows.length === 0) throw new Error(`No account ${accountId}`);
  const r = rows[0];
  return {
    status: r.status as string,
    contact: {
      familyName: r.family_name as string,
      givenName: r.given_name as string,
      telephone: r.telephone as string,
      email: r.email as string,
      address: {
        street1: r.street1 as string,
        street2: r.street2,
        city: r.city as string,
        state: r.state as string,
        zip: r.zip as string,
        country: r.country as string,
      },
    },
    card: {
      cardNumber: r.card_number as string,
      cardType: r.card_type as string,
      expiryDate: r.expiry_date as string,
    },
  };
}
