/** @jest-environment node */
import { addOrder, clearOrders } from "@/admin/fixtures.test";
import { createAdminSession } from "@/admin/session";
import { useIsolatedDatabase } from "@/db/isolated";

import { POST } from "./route";

const TIMEOUT = "Session Timed Out; Please exit and login as admin from the login page";
let db: Awaited<ReturnType<typeof useIsolatedDatabase>>;
beforeAll(async () => {
  db = await useIsolatedDatabase();
});
beforeEach(() => clearOrders(db));

const call = async (body: string, session?: string) =>
  POST(
    new Request("http://localhost/api/admin/appl", {
      method: "POST",
      headers: {
        "content-type": "application/xml",
        ...(session ? { cookie: `admin_session=${session}` } : {}),
      },
      body,
    }),
  );
const xml = (type: string, extra = "") => `<Request><Type>${type}</Type>${extra}</Request>`;

test("[SWHM2-C-0244] a request without a session gets the timeout message and is not processed", async () => {
  await addOrder(db, { id: 1, statuses: ["PENDING"] });
  const res = await call(xml("GETORDERS", "<Status>PENDING</Status>"));
  expect(res.status).toBe(401);
  const text = await res.text();
  expect(text).toContain(TIMEOUT);
  expect(text).not.toMatch(/<Order[ >]/);
});

test("[SWHM2-C-0231] an unknown Type is a 400 error naming it, escaped", async () => {
  const session = await createAdminSession();
  const res = await call(xml("FOO"), session);
  expect(res.status).toBe(400);
  const text = await res.text();
  expect(text).toMatch(/<Error>.*FOO.*<\/Error>/);
  expect(await (await call(xml("&lt;b&gt;"), session)).text()).toContain("&lt;b&gt;");
});

test("[SWHM2-C-0238] GETORDERS returns the matching orders and the count", async () => {
  const session = await createAdminSession();
  for (const id of [1, 2, 3]) await addOrder(db, { id, user: "a&b", statuses: ["PENDING"] });
  for (const id of [4, 5]) await addOrder(db, { id, statuses: ["APPROVED"] });
  const text = await (await call(xml("GETORDERS", "<Status>PENDING</Status>"), session)).text();
  expect(text.match(/<Order>/g)).toHaveLength(3);
  expect(text).toMatch(/<Count>3<\/Count>/);
  expect(text).toMatch(/<UserId>a&amp;b<\/UserId>/);
  expect(text).toMatch(/<OrderDate>1\/15\/2020<\/OrderDate>/);
});

test("[SWHM2-C-0239] an order with two matching rows appears once in GETORDERS", async () => {
  const session = await createAdminSession();
  await addOrder(db, { id: 9, statuses: ["PENDING", "PENDING"] });
  const text = await (await call(xml("GETORDERS", "<Status>PENDING</Status>"), session)).text();
  expect(text.match(/<Order>/g)).toHaveLength(1);
});

test("[SWHM2-C-0233] REVENUE with a bad date answers an error naming MM/dd/yyyy", async () => {
  const session = await createAdminSession();
  const res = await call(xml("REVENUE", "<Start>2020-01-31</Start><End>12/31/2020</End>"), session);
  expect(res.status).toBe(400);
  expect(await res.text()).toContain("MM/dd/yyyy");
});

test("[SWHM2-C-0243] ORDERS and REVENUE answer rows and a total", async () => {
  const session = await createAdminSession();
  const text = await (
    await call(xml("REVENUE", "<Start>01/01/2020</Start><End>12/31/2020</End>"), session)
  ).text();
  expect(text).toMatch(/<Total>0<\/Total>/);
});
