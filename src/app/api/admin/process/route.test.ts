/** @jest-environment node */
import { createAdminSession } from "@/admin/session";
import { useIsolatedDatabase } from "@/db/isolated";

import { POST } from "./route";

beforeAll(async () => {
  await useIsolatedDatabase();
});

const req = (body: string, session?: string, url = "http://localhost:3000/api/admin/process") =>
  new Request(url, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      ...(session ? { cookie: `admin_session=${session}` } : {}),
    },
    body,
  });

test("[SWHM2-C-0236] manageorders returns the Pet Store Admin descriptor with server, port and session", async () => {
  const session = await createAdminSession();
  const res = await POST(req("currentScreen=manageorders", session));
  expect(res.status).toBe(200);
  expect(res.headers.get("content-type")).toMatch(/x-java-jnlp-file/);
  const text = await res.text();
  expect(text).toContain("Pet Store Admin");
  const args = [...text.matchAll(/<argument>([^<]*)<\/argument>/g)].map((m) => m[1]);
  expect(args).toEqual(["localhost", "3000", session]);
});

test("[SWHM2-C-0235] the default port follows the protocol, and other screens are a 400", async () => {
  const session = await createAdminSession();
  const text = await (
    await POST(req("currentScreen=manageorders", session, "https://shop.example/api/admin/process"))
  ).text();
  expect(text).toContain("<argument>443</argument>");
  expect((await POST(req("currentScreen=other", session))).status).toBe(400);
});

test("[SWHM2-C-0241] no admin session is a 401", async () => {
  expect((await POST(req("currentScreen=manageorders"))).status).toBe(401);
});
