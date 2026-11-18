import type { Preferences, ContactInput, CardDetails, Db, Exec } from "./types";

export type CustomerInput = {
  userId: string;
  password: string;
  contact?: ContactInput;
  card?: CardDetails;
  profile?: Partial<Preferences>;
};

export async function createAccount(
  _db: Exec,
  _input: { contact?: ContactInput; card?: CardDetails },
): Promise<number> {
  throw new Error("VortexNotImplemented");
}

export async function createCustomer(
  _db: Db,
  _input: CustomerInput,
  _hooks?: { beforeCommit?: () => void | Promise<void> },
): Promise<{ userId: string; accountId: number; profileId: number }> {
  throw new Error("VortexNotImplemented");
}
