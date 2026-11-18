import { withBasePath } from "@/lib/paths";

/** A 303 to an app path (with the base path), carrying any Set-Cookie headers. */
export function seeOther(path: string, setCookies: string[] = []): Response {
  const headers = new Headers({ Location: withBasePath(path) });
  for (const c of setCookies) headers.append("Set-Cookie", c);
  return new Response(null, { status: 303, headers });
}

/** A cookie header value as a name/value record. */
export function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of (header ?? "").split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    const name = part.slice(0, i).trim();
    if (name) out[name] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}
