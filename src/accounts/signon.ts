import type { Exec } from "./store";

/** True when the user name exists and the password equals the stored one exactly. */
export async function authenticate(
  _db: Exec,
  _username: string,
  _password: string,
): Promise<boolean> {
  throw new Error("VortexNotImplemented");
}
