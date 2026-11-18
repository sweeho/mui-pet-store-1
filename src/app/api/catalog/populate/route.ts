import { NextResponse } from "next/server";

import { hasAdminSession, unauthorized } from "@/admin/session";
import { getDb } from "@/db/client";
import { populateCatalog } from "@/catalog/populate";

/** Load the sample catalog from XML (SWHM2-R-0147). Safe to call again: it upserts. */
export async function POST(request: Request): Promise<Response> {
  // Production requires an administrator session; development and test stay open (design.md D2).
  if (process.env.NODE_ENV === "production" && !(await hasAdminSession(request))) {
    return unauthorized();
  }
  try {
    return NextResponse.json(await populateCatalog(await getDb()));
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Populate failed" },
      { status: 500 },
    );
  }
}
