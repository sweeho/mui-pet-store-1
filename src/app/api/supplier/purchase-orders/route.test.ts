/** @jest-environment node */
import { sql } from "drizzle-orm";

import { useIsolatedDatabase } from "@/db/isolated";

import { GET } from "./[id]/route";
import { POST } from "./route";

let db: Awaited<ReturnType<typeof useIsolatedDatabase>>;
beforeAll(async () => {
  db = await useIsolatedDatabase();
});

const xml = (id: string, item: string, qty: number) =>
  `<SupplierOrder><OrderId>${id}</OrderId><OrderDate>2026-11-18</OrderDate><ShippingInfo><Name>Ann</Name><Address>1 Main St</Address><Email>a@x.com</Email><Phone>555</Phone></ShippingInfo><LineItem><CategoryId>C</CategoryId><ProductId>P</ProductId><ItemId>${item}</ItemId><LineNum>1</LineNum><Quantity>${qty}</Quantity><UnitPrice>9.99</UnitPrice></LineItem></SupplierOrder>`;
const post = (body: string) =>
  POST(new Request("http://localhost/api/supplier/purchase-orders", { method: "POST", body }));
const read = (id: string) =>
  GET(new Request(`http://localhost/api/supplier/purchase-orders/${id}`), {
    params: Promise.resolve({ id }),
  });

describe("/api/supplier/purchase-orders", () => {
  it("[SWHM2-C-0210] a posted order is persisted and fulfilled from stock, without signing in", async () => {
    await db.run(sql`INSERT OR REPLACE INTO inventory (item_id, quantity) VALUES ('SR-1', 5)`);
    const res = await post(xml("SR-ORD-1", "SR-1", 2));
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ orderId: "SR-ORD-1", status: "COMPLETED" });
    const stock = await db.all<{ quantity: number }>(
      sql`SELECT quantity FROM inventory WHERE item_id = 'SR-1'`,
    );
    expect(stock[0].quantity).toBe(3);
    const queues = await db.all<{ queue: string }>(
      sql`SELECT queue FROM message_outbox WHERE order_id = 'SR-ORD-1' ORDER BY id`,
    );
    expect(queues.map((q) => q.queue)).toEqual(["supplier-invoice", "completed-order"]);
  });

  it("[SWHM2-C-0211] an order with too little stock waits PENDING and is readable", async () => {
    await db.run(sql`INSERT OR REPLACE INTO inventory (item_id, quantity) VALUES ('SR-2', 0)`);
    expect((await post(xml("SR-ORD-2", "SR-2", 1))).status).toBe(201);
    const res = await read("SR-ORD-2");
    expect(await res.json()).toEqual({ orderId: "SR-ORD-2", status: "PENDING" });
  });

  it("answers 400 for a document with no line item and 404 for an unknown order", async () => {
    expect((await post("<SupplierOrder><OrderId>X</OrderId></SupplierOrder>")).status).toBe(400);
    expect((await read("NOPE")).status).toBe(404);
  });
});
