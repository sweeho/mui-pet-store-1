import { ADMIN_COOKIE, endAdminSession } from "@/admin/session";
import { getDb } from "@/db/client";

import { parseCookies, seeOther } from "../../accounts/redirects";

/** POST /api/admin/logout (design.md P3): ends the session, expires the cookie, back to sign-in. */
export async function POST(request: Request): Promise<Response> {
  const id = parseCookies(request.headers.get("cookie"))[ADMIN_COOKIE];
  await endAdminSession(await getDb(), id);
  return seeOther("/admin/login", [`${ADMIN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`]);
}
