import { NextResponse } from "next/server";

import { getDb } from "@/db/client";
import { populateCatalog } from "@/catalog/populate";

/** Load the sample catalog from XML (SWHM2-R-0147). Safe to call again: it upserts. */
export async function POST(): Promise<Response> {
  try {
    return NextResponse.json(await populateCatalog(await getDb()));
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Populate failed" },
      { status: 500 },
    );
  }
}
