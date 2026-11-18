/** @jest-environment node */
import { useIsolatedDatabase } from "@/db/isolated";

import { adminCredentials, hasAdminSession, createAdminSession } from "./session";

jest.mock("next/headers", () => ({ cookies: jest.fn() }));
jest.mock("next/navigation", () => ({ redirect: jest.fn() }));

beforeAll(async () => {
  await useIsolatedDatabase();
});

const req = (cookie?: string) =>
  new Request("http://localhost/api/admin/orders/1", { headers: cookie ? { cookie } : {} });

test("a created session is recognised by its cookie, and nothing else is", async () => {
  const id = await createAdminSession();
  expect(await hasAdminSession(req(`admin_session=${id}`))).toBe(true);
  expect(await hasAdminSession(req("admin_session=nope"))).toBe(false);
  expect(await hasAdminSession(req())).toBe(false);
});

test("credentials default to j2ee and come from the environment when set", () => {
  expect(adminCredentials()).toEqual({ user: "j2ee", password: "j2ee" });
  process.env.ADMIN_USER = "boss";
  process.env.ADMIN_PASSWORD = "secret";
  expect(adminCredentials()).toEqual({ user: "boss", password: "secret" });
  delete process.env.ADMIN_USER;
  delete process.env.ADMIN_PASSWORD;
});
