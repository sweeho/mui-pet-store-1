import { SESSION_COOKIE, deleteSession } from "@/accounts/web-session";
import { getDb } from "@/db/client";

import { parseCookies, seeOther } from "../redirects";

/** POST /api/accounts/signoff: end the session now, before the idle timeout. */
export async function POST(request: Request): Promise<Response> {
  const id = parseCookies(request.headers.get("cookie"))[SESSION_COOKIE];
  if (id) await deleteSession(await getDb(), id);
  return seeOther("/", [`${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`]);
}
