/** @jest-environment node */
import { createAdminSession, hasAdminSession } from "@/admin/session";
import { useIsolatedDatabase } from "@/db/isolated";

import { POST } from "./route";

jest.mock("next/headers", () => ({ cookies: jest.fn() }));
jest.mock("next/navigation", () => ({ redirect: jest.fn() }));

beforeAll(async () => {
  await useIsolatedDatabase();
});

test("[SWHM2-C-0242] logout deletes the session, expires the cookie and redirects to sign-in", async () => {
  const id = await createAdminSession();
  const request = new Request("http://localhost/api/admin/logout", {
    method: "POST",
    headers: { cookie: `admin_session=${id}` },
  });
  const res = await POST(request);
  expect(res.status).toBe(303);
  expect(res.headers.get("location")).toMatch(/\/admin\/login$/);
  expect(res.headers.get("set-cookie")).toMatch(/admin_session=;.*Max-Age=0/);
  expect(await hasAdminSession(request)).toBe(false);
});
