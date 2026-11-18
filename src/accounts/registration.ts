import { createCustomer } from "./customers";
import { createProfile, type ProfileSubmission, recordProfile } from "./profile";
import { MAX_PASSWORD, MAX_USER_ID } from "./limits";
import type { Db } from "./store";

export const CREATE_ERROR_PAGE = "/accounts/create-error";
export { MAX_USER_ID, MAX_PASSWORD } from "./limits";

export type Registration = ProfileSubmission & { userId: string; password: string };

/** Why a new user ID or password is refused, or null when both are acceptable (R-0164). */
export function validateNewUser(userId: string, password: string): string | null {
  if (!userId) return "User ID is required.";
  if (userId.length > MAX_USER_ID) return `User ID must be ${MAX_USER_ID} characters or fewer.`;
  if (/[%*]/.test(userId)) return "User ID can't contain % or *.";
  if (!password) return "Password is required.";
  if (password.length > MAX_PASSWORD)
    return `Password must be ${MAX_PASSWORD} characters or fewer.`;
  return null;
}

/** Create a new user; any refusal or failure answers the error page and creates nothing. */
export async function registerUser(
  db: Db,
  input: Registration,
  hooks: { beforeCommit?: () => void | Promise<void> } = {},
): Promise<{ ok: true; userId: string } | { ok: false; redirect: string }> {
  if (validateNewUser(input.userId, input.password) !== null) {
    return { ok: false, redirect: CREATE_ERROR_PAGE };
  }
  const submitted =
    input.language !== undefined ||
    input.favoriteCategory !== undefined ||
    input.myList !== undefined ||
    input.banner !== undefined;
  try {
    await createCustomer(
      db,
      {
        userId: input.userId,
        password: input.password,
        profile: submitted ? recordProfile(input) : createProfile(),
      },
      hooks,
    );
    return { ok: true, userId: input.userId };
  } catch {
    // A duplicate user name, or any other failure, ends on the error page (R-0165).
    return { ok: false, redirect: CREATE_ERROR_PAGE };
  }
}
