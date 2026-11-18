/** @jest-environment node */
import { sql } from "drizzle-orm";

import { createAdminSession } from "@/admin/session";
import { seedOrder } from "@/approval/helpers.test";
import { useIsolatedDatabase } from "@/db/isolated";

import { POST as login } from "./login/route";
import { POST as commit } from "./approvals/route";
import { GET as sent } from "./approvals/sent/route";
import { GET as order } from "./orders/[id]/route";

let db: Awaited<ReturnType<typeof useIsolatedDatabase>>;
let cookie: string;
beforeAll(async () => {
  db = await useIsolatedDatabase();
  cookie = `admin_session=${await createAdminSession()}`;
});
beforeEach(async () => {
  // No stock: these tests are about approval, and stock would ship the approved orders.
  for (const t of [
    "order_manager",
    "order_line",
    "purchase_order",
    "message_outbox",
    "inventory",
  ]) {
    await db.run(sql.raw(`DELETE FROM ${t}`));
  }
});

const env = () => ({ db }) as unknown as Parameters<typeof seedOrder>[0];
const get = (path: string, c?: string) =>
  new Request(`http://localhost${path}`, { headers: c ? { cookie: c } : {} });
const post = (body: unknown, c?: string) =>
  new Request("http://localhost/api/admin/approvals", {
    method: "POST",
    headers: { "content-type": "application/json", ...(c ? { cookie: c } : {}) },
    body: JSON.stringify(body),
  });
const form = (fields: Record<string, string>) =>
  new Request("http://localhost/api/admin/login", {
    method: "POST",
    body: new URLSearchParams(fields),
  });

test("login answers 303 to the orders screen with a session cookie, or back with an error", async () => {
  const ok = await login(form({ userId: "j2ee", password: "j2ee" }));
  expect(ok.status).toBe(303);
  expect(ok.headers.get("location")).toMatch(/\/admin\/orders$/);
  expect(ok.headers.get("set-cookie")).toMatch(/^admin_session=.+HttpOnly/);
  const bad = await login(form({ userId: "j2ee", password: "wrong" }));
  expect(bad.status).toBe(303);
  expect(bad.headers.get("location")).toMatch(/\/admin\/login\?error=1$/);
  expect(bad.headers.get("set-cookie")).toBeNull();
});

test("every admin route answers 401 without an admin session", async () => {
  expect((await commit(post({ decisions: [] }))).status).toBe(401);
  expect((await sent(get("/api/admin/approvals/sent"))).status).toBe(401);
  const p = { params: Promise.resolve({ id: "1" }) };
  expect((await order(get("/api/admin/orders/1"), p)).status).toBe(401);
});

test("Commit sends one message per decision, changes only PENDING orders, and sent lists them", async () => {
  await seedOrder(env(), 600, "PENDING");
  await seedOrder(env(), 601, "PENDING");
  await seedOrder(env(), 602, "APPROVED");
  const res = await commit(
    post(
      {
        decisions: [
          { orderId: "600", status: "APPROVED" },
          { orderId: "601", status: "DENIED" },
          { orderId: "602", status: "DENIED" },
        ],
      },
      cookie,
    ),
  );
  expect(await res.json()).toEqual({ sent: 3, approved: ["600"], denied: ["601"] });
  const read = async (id: string) =>
    (
      await (
        await order(get(`/api/admin/orders/${id}`, cookie), { params: Promise.resolve({ id }) })
      ).json()
    ).status;
  expect([await read("600"), await read("601"), await read("602")]).toEqual([
    "APPROVED",
    "DENIED",
    "APPROVED",
  ]);
  const body = (await (await sent(get("/api/admin/approvals/sent", cookie))).json()) as {
    messages: unknown[];
  };
  expect(body.messages).toEqual([
    { orderId: "600", status: "APPROVED" },
    { orderId: "601", status: "DENIED" },
    { orderId: "602", status: "DENIED" },
  ]);
});

test("a malformed Commit body is a 400 and an unknown order is a 404", async () => {
  expect(
    (await commit(post({ decisions: [{ orderId: "1", status: "SHIPPED" }] }, cookie))).status,
  ).toBe(400);
  expect((await commit(post({}, cookie))).status).toBe(400);
  const res = await order(get("/api/admin/orders/nope", cookie), {
    params: Promise.resolve({ id: "nope" }),
  });
  expect(res.status).toBe(404);
});
