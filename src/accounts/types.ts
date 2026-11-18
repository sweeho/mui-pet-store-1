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
