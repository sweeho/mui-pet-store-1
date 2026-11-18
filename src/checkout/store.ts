import type { Exec } from "@/accounts/types";

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
export async function storeAddress(_db: Exec, _addr: AddressInput): Promise<number> {
  throw new Error("VortexNotImplemented");
}

/** Store a credit card; resolves its id. A missing required field rejects and leaves no row. */
export async function storeCreditCard(_db: Exec, _card: CardInput): Promise<number> {
  throw new Error("VortexNotImplemented");
}
