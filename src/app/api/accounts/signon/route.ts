import { SESSION_COOKIE, saveSession } from "@/accounts/web-session";
import {
  DEFAULT_LANGUAGE,
  createCart,
  createSession,
  safeReturnTo,
  signOn,
} from "@/accounts/session";
import { getDb } from "@/db/client";

import { parseCookies, seeOther } from "../redirects";

const field = (form: FormData, name: string) => {
  const v = form.get(name);
  return typeof v === "string" ? v : "";
};

/** POST /api/accounts/signon: the sign-on form. Always answers 303: onward, or the error page. */
export async function POST(request: Request): Promise<Response> {
  const form = await request.formData();
  const returnTo = safeReturnTo(field(form, "returnTo"));
  const db = await getDb();
  const session = createSession({ language: DEFAULT_LANGUAGE });
  const cart = createCart({ language: DEFAULT_LANGUAGE });
  const result = await signOn(db, {
    username: field(form, "username"),
    password: field(form, "password"),
    remember: form.get("remember") !== null,
    cookies: parseCookies(request.headers.get("cookie")),
    session,
    cart,
    returnTo,
  });
  if (!result.ok) {
    return seeOther(`${result.redirect}?returnTo=${encodeURIComponent(returnTo)}`);
  }
  const id = await saveSession(db, session, cart);
  return seeOther(result.redirect, [
    `${SESSION_COOKIE}=${id}; Path=/; HttpOnly; SameSite=Lax`,
    ...result.setCookies,
  ]);
}
