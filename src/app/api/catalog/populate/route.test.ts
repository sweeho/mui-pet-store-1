/** @jest-environment node */
import { getDb } from "@/db/client";
import { count, resetData } from "@/catalog/fixtures.test";

import { POST } from "./route";

describe("POST /api/catalog/populate", () => {
  it("[SWHM2-C-0018] loads the sample catalog, and again changes nothing", async () => {
    const db = await getDb();
    await resetData(db);
    const first = await POST();
    expect(first.status).toBe(200);
    const body = (await first.json()) as { categories: number; products: number; items: number };
    expect(body.categories).toBeGreaterThan(0);
    expect(await count(db, "category")).toBe(body.categories);
    expect(await count(db, "product")).toBe(body.products);
    expect(await count(db, "item")).toBe(body.items);

    const second = await POST();
    expect(await second.json()).toEqual(body);
    expect(await count(db, "item")).toBe(body.items);
    await resetData(db);
  });
});
