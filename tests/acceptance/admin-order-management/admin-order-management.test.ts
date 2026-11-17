/** @jest-environment node */
import { getDb } from "@/db/client";
import { buildLaunchDescriptor } from "@/admin/launch";
import { listOrderOperations, listOrdersByStatus } from "@/admin/orders";
import { getChartInfo, salesReport } from "@/admin/reports";
import { createAdminSession } from "@/admin/session";
import { POST as applPost } from "@/app/api/admin/appl/route";
import { POST as processPost } from "@/app/api/admin/process/route";
import {
  SESSION_TIMEOUT_MESSAGE,
  type Db,
  appRequest,
  insertItem,
  insertOrder,
  resetData,
  xmlRequest,
} from "./harness";

let db: Db;

beforeAll(async () => {
  db = await getDb();
});

beforeEach(async () => {
  await resetData(db);
});

const XML = "application/xml";
const FORM = "application/x-www-form-urlencoded";

async function appl(body: string, session?: string): Promise<string> {
  const res = await applPost(appRequest("/api/admin/appl", body, XML, session));
  return res.text();
}

const RANGE = { start: "01/01/2020", end: "12/31/2020" };

async function seedSales(): Promise<void> {
  await insertItem(db, { id: "FISH-1", category: "FISH", price: 10 });
  await insertItem(db, { id: "FISH-2", category: "FISH", price: 5 });
  await insertItem(db, { id: "DOGS-1", category: "DOGS", price: 100 });
  await insertOrder(db, {
    id: 1,
    time: new Date(2020, 5, 1, 12),
    statuses: ["APPROVED"],
    lines: [
      { item: "FISH-1", quantity: 3 },
      { item: "DOGS-1", quantity: 2 },
    ],
  });
  await insertOrder(db, {
    id: 2,
    time: new Date(2020, 6, 1, 12),
    statuses: ["APPROVED"],
    lines: [{ item: "FISH-2", quantity: 4 }],
  });
}

// case: SWHM2-C-0230@v1
test("SWHM2-C-0230 order operations view lists only orders with a status row", async () => {
  await insertOrder(db, {
    id: 1,
    user: "alice",
    time: new Date(2020, 0, 31, 12),
    total: 42.5,
    statuses: ["PENDING"],
  });
  await insertOrder(db, { id: 2, user: "bob", statuses: [] });
  const rows = await listOrderOperations(db);
  expect(rows).toHaveLength(1);
  expect(rows[0]).toMatchObject({ orderId: 1, userId: "alice", value: 42.5, status: "PENDING" });
  expect(rows[0].date).toBeTruthy();
});

// case: SWHM2-C-0231@v1
test("SWHM2-C-0231 unknown XML request type returns an error naming it", async () => {
  const session = await createAdminSession();
  const text = await appl(xmlRequest("FOO"), session);
  expect(text).toMatch(/error/i);
  expect(text).toContain("FOO");
});

// case: SWHM2-C-0233@v1
test("SWHM2-C-0233 ISO report date is rejected with the MM/dd/yyyy message", async () => {
  const result = await salesReport(db, { start: "2020-01-31", end: "12/31/2020", type: "REVENUE" });
  expect(result).toHaveProperty("error");
  expect((result as { error: string }).error).toContain("MM/dd/yyyy");
});

// case: SWHM2-C-0235@v1
test("SWHM2-C-0235 manage orders returns a launch descriptor with server, port and session id", () => {
  const text = buildLaunchDescriptor({ server: "shop.example", port: 8443, sessionId: "sess-123" });
  expect(text).toContain("shop.example");
  expect(text).toContain("8443");
  expect(text).toContain("sess-123");
});

// case: SWHM2-C-0236@v1
test("SWHM2-C-0236 manageorders submission returns the Pet Store Admin descriptor", async () => {
  const session = await createAdminSession();
  const res = await processPost(
    appRequest("/api/admin/process", "currentScreen=manageorders", FORM, session),
  );
  const text = await res.text();
  expect(res.status).toBe(200);
  expect(text).toContain("Pet Store Admin");
  expect(text).toContain(session);
  expect(text).toMatch(/localhost/);
  expect(text).toMatch(/<argument>[^<]*\d+[^<]*<\/argument>|port/i);
});

// case: SWHM2-C-0237@v1
test("SWHM2-C-0237 PENDING listing returns id, user, month/day/year date, value and status", async () => {
  await insertOrder(db, {
    id: 7,
    user: "carol",
    time: new Date(2020, 0, 5, 12),
    total: 99.5,
    statuses: ["PENDING"],
  });
  await insertOrder(db, { id: 8, statuses: ["APPROVED"] });
  const rows = await listOrdersByStatus(db, "PENDING");
  expect(rows).toEqual([
    { orderId: 7, userId: "carol", date: "1/5/2020", value: 99.5, status: "PENDING" },
  ]);
});

// case: SWHM2-C-0238@v1
test("SWHM2-C-0238 GETORDERS returns the matching orders and the total count", async () => {
  const session = await createAdminSession();
  for (const id of [1, 2, 3]) await insertOrder(db, { id, statuses: ["PENDING"] });
  for (const id of [4, 5]) await insertOrder(db, { id, statuses: ["APPROVED"] });
  const text = await appl(xmlRequest("GETORDERS", "PENDING"), session);
  expect(text.match(/<Order[ >]/g) ?? []).toHaveLength(3);
  expect(text).toMatch(/<Count>\s*3\s*<\/Count>/);
});

// case: SWHM2-C-0239@v1
test("SWHM2-C-0239 an order matching through several rows appears once", async () => {
  await insertOrder(db, { id: 9, statuses: ["PENDING", "PENDING"] });
  const rows = await listOrdersByStatus(db, "PENDING");
  expect(rows.filter((r) => r.orderId === 9)).toHaveLength(1);
});

// case: SWHM2-C-0240@v1
test("SWHM2-C-0240 a type other than REVENUE totals quantities", async () => {
  await seedSales();
  const result = await getChartInfo(db, { ...RANGE, type: "QUANTITY" });
  expect(result).not.toHaveProperty("error");
  const { rows, total } = result as { rows: { name: string; value: number }[]; total: number };
  expect(Object.fromEntries(rows.map((r) => [r.name, r.value]))).toEqual({ FISH: 7, DOGS: 2 });
  expect(total).toBe(9);
});

// case: SWHM2-C-0243@v1
test("SWHM2-C-0243 REVENUE report by category with grand total, by item for a category", async () => {
  await seedSales();
  const byCategory = (await salesReport(db, { ...RANGE, type: "REVENUE" })) as {
    rows: { name: string; value: number }[];
    total: number;
  };
  expect(Object.fromEntries(byCategory.rows.map((r) => [r.name, r.value]))).toEqual({
    FISH: 50,
    DOGS: 200,
  });
  expect(byCategory.total).toBe(250);

  const byItem = (await salesReport(db, { ...RANGE, type: "REVENUE", category: "FISH" })) as {
    rows: { name: string; value: number }[];
    total: number;
  };
  expect(Object.fromEntries(byItem.rows.map((r) => [r.name, r.value]))).toEqual({
    "FISH-1": 30,
    "FISH-2": 20,
  });
  expect(byItem.total).toBe(50);
});

// case: SWHM2-C-0244@v1
test("SWHM2-C-0244 rich-client request without a session is refused and not processed", async () => {
  await insertOrder(db, { id: 1, statuses: ["PENDING"] });
  const text = await appl(xmlRequest("GETORDERS", "PENDING"));
  expect(text).toContain(SESSION_TIMEOUT_MESSAGE);
  expect(text).not.toMatch(/<Order[ >]/);
});
