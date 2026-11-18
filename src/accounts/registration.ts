import type { ProfileSubmission } from "./profile";
import type { Db } from "./store";

export const CREATE_ERROR_PAGE = "/accounts/create-error";

export type Registration = ProfileSubmission & { userId: string; password: string };

export async function registerUser(
  _db: Db,
  _input: Registration,
  _hooks?: { beforeCommit?: () => void | Promise<void> },
): Promise<{ ok: true; userId: string } | { ok: false; redirect: string }> {
  throw new Error("VortexNotImplemented");
}
