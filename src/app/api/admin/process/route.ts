import { buildLaunchDescriptor } from "@/admin/launch";
import { ADMIN_COOKIE, hasAdminSession, unauthorized } from "@/admin/session";

import { parseCookies } from "../../accounts/redirects";

/**
 * POST /api/admin/process (design.md P9): the admin home form. `currentScreen=manageorders` answers the
 * Pet Store Admin launch descriptor with the server, port and session id; no session is a 401.
 */
export async function POST(request: Request): Promise<Response> {
  if (!(await hasAdminSession(request))) return unauthorized();
  const form = await request.formData().catch(() => null);
  if (form?.get("currentScreen") !== "manageorders") {
    return Response.json({ error: "unknown screen" }, { status: 400 });
  }
  const url = new URL(request.url);
  const port = url.port || (url.protocol === "https:" ? "443" : "80");
  const sessionId = parseCookies(request.headers.get("cookie"))[ADMIN_COOKIE] ?? "";
  return new Response(buildLaunchDescriptor({ server: url.hostname, port, sessionId }), {
    headers: { "content-type": "application/x-java-jnlp-file" },
  });
}
