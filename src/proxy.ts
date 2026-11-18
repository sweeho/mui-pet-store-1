import { NextResponse, type NextRequest } from "next/server";

/**
 * A request for an admin page with no admin session cookie gets a real 307 to the sign-in, before
 * the page streams (the page's own requireAdmin still checks the session row).
 */
export function proxy(request: NextRequest) {
  if (request.cookies.has("admin_session")) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/admin", "/admin/orders", "/admin/reports"] };
