/** @jest-environment node */
import { sql } from "drizzle-orm";

import { ADMIN_COOKIE, createAdminSession } from "@/admin/session";
import { useIsolatedDatabase } from "@/db/isolated";
import { POST as postSupplier } from "@/app/api/supplier/purchase-orders/route";
import { GET as readSupplier } from "@/app/api/supplier/purchase-orders/[id]/route";

import { POST } from "./route";

let db: Awaited<ReturnType<typeof useIsolatedDatabase>>;
beforeAll(async () => {
  db = await useIsolatedDatabase();
});

const stockOf = async (item: string) =>
  (
    await db.all<{ quantity: number }>(sql`SELECT quantity FROM inventory WHERE item_id = ${item}`)
  )[0]?.quantity;
const submit = async (fields: Record<string, string>, signedIn = true) =>
  POST(
    new Request("http://localhost/api/admin/inventory", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        ...(signedIn ? { cookie: `${ADMIN_COOKIE}=${await createAdminSession()}` } : {}),
      },
      body: new URLSearchParams(fields),
    }),
  );

describe("POST /api/admin/inventory", () => {
  it("answers 401 without an administrator session", async () => {
    await db.run(sql`INSERT OR REPLACE INTO inventory (item_id, quantity) VALUES ('AI-0', 1)`);
    expect((await submit({ "qty_AI-0": "9", "item_AI-0": "on" }, false)).status).toBe(401);
    expect(await stockOf("AI-0")).toBe(1);
  });

  it("[SWHM2-C-0195] an unticked row keeps its stock", async () => {
    await db.run(sql`INSERT OR REPLACE INTO inventory (item_id, quantity) VALUES ('AI-1', 7)`);
    const res = await submit({ "qty_AI-1": "99" });
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toContain("/admin/inventory?updated=0");
    expect(await stockOf("AI-1")).toBe(7);
  });

  it("[SWHM2-C-0211] a ticked row sets the quantity and reprocesses waiting orders", async () => {
    await db.run(sql`INSERT OR REPLACE INTO inventory (item_id, quantity) VALUES ('AI-2', 0)`);
    const body = `<SupplierOrder><OrderId>AI-ORD</OrderId><OrderDate>2026-11-18</OrderDate><ShippingInfo><Name>Ann</Name><Address>1 Main St</Address><Email>a@x.com</Email><Phone>555</Phone></ShippingInfo><LineItem><CategoryId>C</CategoryId><ProductId>P</ProductId><ItemId>AI-2</ItemId><LineNum>1</LineNum><Quantity>1</Quantity><UnitPrice>9.99</UnitPrice></LineItem></SupplierOrder>`;
    await postSupplier(new Request("http://localhost/x", { method: "POST", body }));
    const read = async () =>
      (
        (await (
          await readSupplier(new Request("http://localhost/x"), {
            params: Promise.resolve({ id: "AI-ORD" }),
          })
        ).json()) as { status: string }
      ).status;
    expect(await read()).toBe("PENDING");
    const res = await submit({ "qty_AI-2": "5", "item_AI-2": "on" });
    expect(res.headers.get("location")).toContain("/admin/inventory?updated=1");
    expect(await stockOf("AI-2")).toBe(4);
    expect(await read()).toBe("COMPLETED");
  });
});
