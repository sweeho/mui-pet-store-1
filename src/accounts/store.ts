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

export async function storeContact(
  _db: Exec,
  _c: {
    familyName: string;
    givenName: string;
    telephone: string;
    email: string;
    addressId: number;
  },
): Promise<number> {
  throw new Error("VortexNotImplemented");
}

export async function storeAccount(
  _db: Exec,
  _a: { status: string; contactId: number; cardId: number },
): Promise<number> {
  throw new Error("VortexNotImplemented");
}

export async function storeProfile(
  _db: Exec,
  _p: { language: string; favoriteCategory?: string | null; myList: boolean; banner: boolean },
): Promise<number> {
  throw new Error("VortexNotImplemented");
}

export async function storeSignOn(
  _db: Exec,
  _s: { username: string; password: string },
): Promise<void> {
  throw new Error("VortexNotImplemented");
}

export async function storeCustomer(
  _db: Exec,
  _c: { userId: string; accountId: number; profileId: number },
): Promise<string> {
  throw new Error("VortexNotImplemented");
}

export async function getProfile(_db: Exec, _profileId: number): Promise<Preferences> {
  throw new Error("VortexNotImplemented");
}

export async function getAccount(_db: Exec, _accountId: number): Promise<AccountView> {
  throw new Error("VortexNotImplemented");
}
