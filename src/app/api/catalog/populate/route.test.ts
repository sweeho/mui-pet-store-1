/** @jest-environment node */
import { useIsolatedDatabase } from "@/db/isolated";
import { count, resetData } from "@/catalog/fixtures.test";

import { createAdminSession } from "@/admin/session";

import { POST } from "./route";

const req = (cookie?: string) =>
  new Request("http://localhost/api/catalog/populate", {
    method: "POST",
    headers: cookie ? { cookie } : {},
  });

describe("POST /api/catalog/populate", () => {
  it("[SWHM2-C-0018] loads the sample catalog, and again changes nothing", async () => {
    const db = await useIsolatedDatabase();
    await resetData(db);
    const first = await POST(req());
    expect(first.status).toBe(200);
    const body = (await first.json()) as { categories: number; products: number; items: number };
    expect(body.categories).toBeGreaterThan(0);
    expect(await count(db, "category")).toBe(body.categories);
    expect(await count(db, "product")).toBe(body.products);
    expect(await count(db, "item")).toBe(body.items);

    const second = await POST(req());
    expect(await second.json()).toEqual(body);
    expect(await count(db, "item")).toBe(body.items);
    await resetData(db);
  });

  it("[SWHM2-C-0245] refuses an anonymous caller in production and writes nothing", async () => {
    const db = await useIsolatedDatabase();
    await resetData(db);
    jest.replaceProperty(process.env, "NODE_ENV", "production");
    try {
      const res = await POST(req());
      expect(res.status).toBe(401);
      expect(await count(db, "category")).toBe(0);
      expect(await count(db, "product")).toBe(0);
      expect(await count(db, "item")).toBe(0);
    } finally {
      jest.restoreAllMocks();
    }
  });

  it("[SWHM2-C-0246] loads the sample catalog for an administrator in production", async () => {
    const db = await useIsolatedDatabase();
    await resetData(db);
    const id = await createAdminSession();
    jest.replaceProperty(process.env, "NODE_ENV", "production");
    try {
      const res = await POST(req(`admin_session=${id}`));
      expect(res.status).toBe(200);
      const body = (await res.json()) as { categories: number; products: number; items: number };
      expect(body.categories).toBeGreaterThan(0);
      expect(body.products).toBeGreaterThan(0);
      expect(body.items).toBeGreaterThan(0);
      expect(await count(db, "category")).toBe(body.categories);
      expect(await count(db, "product")).toBe(body.products);
      expect(await count(db, "item")).toBe(body.items);
    } finally {
      jest.restoreAllMocks();
    }
    await resetData(db);
  });

  it("[SWHM2-C-0247] loads the sample catalog for an anonymous caller outside production", async () => {
    const db = await useIsolatedDatabase();
    await resetData(db);
    for (const env of ["test", "development"]) {
      jest.replaceProperty(process.env, "NODE_ENV", env as "test");
      try {
        await resetData(db);
        const res = await POST(req());
        expect(res.status).toBe(200);
        const body = (await res.json()) as { categories: number; products: number; items: number };
        expect(body.categories).toBeGreaterThan(0);
        expect(await count(db, "category")).toBe(body.categories);
        expect(await count(db, "product")).toBe(body.products);
        expect(await count(db, "item")).toBe(body.items);
      } finally {
        jest.restoreAllMocks();
      }
    }
    await resetData(db);
  });
});
