import { sql } from "drizzle-orm";

import { recordOrderStatus } from "@/approval/orders";

import { xmlText, type LineItem, type LineRow, type Shipping } from "./documents";
import { inTransaction, type FulfilEnv, type TxEnv } from "./env";

// The five statuses of a supplier order (design.md P3, SD1). Approval keeps its own four-value set.
export const ORDER_STATUSES = [
  "PENDING",
  "APPROVED",
  "DENIED",
  "COMPLETED",
  "SHIPPED_PART",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const isOrderStatus = (s: string): s is OrderStatus =>
  (ORDER_STATUSES as readonly string[]).includes(s);

export type SupplierOrderInput = {
  orderId: string;
  date: Date;
  shipping: Shipping;
  lines: LineItem[];
};
export type SupplierOrder = {
  orderId: string;
  date: number;
  status: string;
  contactId: number;
  shipping: Shipping;
  lines: LineRow[];
};
export type PurchaseOrderInput = {
  orderId: string;
  userName: string;
  shipping: Shipping;
  lines: LineItem[];
};
export type PurchaseOrder = {
  orderId: string;
  billing: Shipping;
  shipping: Shipping;
  contactId: number;
  lines: LineRow[];
};
export type OrderStatusRow = {
  orderId: string | number;
  userName: string;
  date: number;
  value: number;
  status: string;
};

type LineSql = {
  line_num: number;
  category_id: string | null;
  product_id: string | null;
  item_id: string;
  quantity: number;
  unit_price: number | null;
  quantity_shipped: number;
};
type ContactSql = {
  name: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
};

const toShipping = (c: ContactSql): Shipping => ({
  name: c.name ?? "",
  address: c.address ?? "",
  email: c.email ?? "",
  phone: c.phone ?? "",
});
const toLineRow = (l: LineSql): LineRow => ({
  categoryId: l.category_id,
  productId: l.product_id,
  itemId: l.item_id,
  lineNum: Number(l.line_num),
  quantity: Number(l.quantity),
  unitPrice: l.unit_price === null ? null : Number(l.unit_price),
  quantityShipped: Number(l.quantity_shipped),
});

/**
 * Every status write of a supplier order goes through here (design.md P3): the order, the
 * one-per-order `order_status` row, and, for COMPLETED, the customer order of the same id.
 */
export async function setSupplierStatus(
  env: TxEnv,
  orderId: string,
  status: OrderStatus,
): Promise<void> {
  if (!isOrderStatus(status)) throw new Error(`invalid order status: ${status}`);
  const changed = await env.db.all(
    sql`UPDATE supplier_order SET status = ${status} WHERE order_id = ${orderId} RETURNING order_id`,
  );
  if (changed.length === 0) throw new Error(`unknown supplier order: ${orderId}`);
  await env.db.run(
    sql`INSERT INTO order_status (order_id, status) VALUES (${orderId}, ${status})
        ON CONFLICT(order_id) DO UPDATE SET status = excluded.status`,
  );
  if (status === "COMPLETED") {
    const customer = await env.db.all(
      sql`SELECT 1 FROM purchase_order WHERE order_id = ${orderId}`,
    );
    if (customer.length > 0) {
      await recordOrderStatus(
        { db: env.db, now: env.now, approvalQueue: [], supplierQueue: [], notifyList: [] },
        orderId,
        "COMPLETED",
      );
    }
  }
}

async function insertContact(env: TxEnv, orderId: string, s: Shipping): Promise<number> {
  const rows = (await env.db.all(
    sql`INSERT INTO contact_info (order_id, name, address, email, phone)
        VALUES (${orderId}, ${s.name}, ${s.address}, ${s.email}, ${s.phone})
        RETURNING contact_id`,
  )) as { contact_id: number }[];
  return Number(rows[0].contact_id);
}

/** Store a supplier order PENDING with its one contact and its lines; all or nothing. */
export async function createSupplierOrder(env: FulfilEnv, o: SupplierOrderInput): Promise<void> {
  if (!o.orderId) throw new Error("a supplier order needs an id");
  if (o.lines.length === 0) throw new Error("a supplier order needs at least one line item");
  await inTransaction(env, async (tx) => {
    const contactId = await insertContact(tx, o.orderId, o.shipping);
    await tx.db.run(
      sql`INSERT INTO supplier_order (order_id, order_date, status, contact_id)
          VALUES (${o.orderId}, ${o.date.getTime()}, 'PENDING', ${contactId})`,
    );
    for (const l of o.lines) {
      await tx.db.run(
        sql`INSERT INTO supplier_order_line
              (order_id, line_num, category_id, product_id, item_id, quantity, unit_price)
            VALUES (${o.orderId}, ${l.lineNum}, ${l.categoryId}, ${l.productId}, ${l.itemId},
                    ${l.quantity}, ${l.unitPrice})`,
      );
    }
    await tx.db.run(sql`INSERT INTO order_status (order_id, status) VALUES (${o.orderId}, 'PENDING')
        ON CONFLICT(order_id) DO UPDATE SET status = excluded.status`);
  });
}

/** The line items as plain data objects, so they outlive the transaction that read them. */
export async function getLineItems(env: TxEnv, orderId: string): Promise<LineRow[]> {
  const rows = (await env.db.all(
    sql`SELECT line_num, category_id, product_id, item_id, quantity, unit_price, quantity_shipped
        FROM supplier_order_line WHERE order_id = ${orderId} ORDER BY line_num`,
  )) as LineSql[];
  return rows.map(toLineRow);
}

export async function getSupplierOrder(env: TxEnv, orderId: string): Promise<SupplierOrder> {
  const rows = (await env.db.all(
    sql`SELECT o.order_date, o.status, o.contact_id, c.name, c.address, c.email, c.phone
        FROM supplier_order o JOIN contact_info c ON c.contact_id = o.contact_id
        WHERE o.order_id = ${orderId}`,
  )) as (ContactSql & { order_date: number; status: string; contact_id: number })[];
  if (rows.length === 0) throw new Error(`unknown supplier order: ${orderId}`);
  const r = rows[0];
  return {
    orderId,
    date: Number(r.order_date),
    status: r.status,
    contactId: Number(r.contact_id),
    shipping: toShipping(r),
    lines: await getLineItems(env, orderId),
  };
}

/** PENDING becomes APPROVED; an order in any other status is left as it is. */
export async function approveOrder(env: FulfilEnv, orderId: string): Promise<void> {
  const order = await getSupplierOrder(env, orderId);
  if (order.status === "PENDING") {
    await inTransaction(env, (tx) => setSupplierStatus(tx, orderId, "APPROVED"));
  }
}

export async function findOrdersByStatus(env: TxEnv, status: string): Promise<string[]> {
  const rows = (await env.db.all(
    sql`SELECT order_id FROM supplier_order WHERE status = ${status} ORDER BY rowid`,
  )) as { order_id: string }[];
  return rows.map((r) => r.order_id);
}

/** One row per customer order, with its latest process-manager status (view `v_order_status`). */
export async function listOrderStatus(env: TxEnv): Promise<OrderStatusRow[]> {
  const rows = (await env.db.all(
    sql`SELECT order_id, user_name, order_time, total_price, status FROM v_order_status
        ORDER BY order_time DESC, order_id`,
  )) as {
    order_id: string | number;
    user_name: string;
    order_time: number;
    total_price: number;
    status: string;
  }[];
  return rows.map((r) => ({
    orderId: r.order_id,
    userName: r.user_name,
    date: Number(r.order_time),
    value: Number(r.total_price),
    status: r.status,
  }));
}

/** A customer purchase order with its contact (also its billing contact, SD8) and lines. */
export async function createPurchaseOrder(env: FulfilEnv, o: PurchaseOrderInput): Promise<void> {
  const total = o.lines.reduce((sum, l) => sum + l.quantity * (l.unitPrice ?? 0), 0);
  await inTransaction(env, async (tx) => {
    await insertContact(tx, o.orderId, o.shipping);
    await tx.db.run(
      sql`INSERT INTO purchase_order (order_id, user_name, order_time, locale, total_price, status)
          VALUES (${o.orderId}, ${o.userName}, ${env.now().getTime()}, 'en_US', ${total}, 'PENDING')`,
    );
    for (const l of o.lines) {
      await tx.db.run(
        sql`INSERT INTO order_line
              (order_id, line_num, category_id, product_id, item_id, quantity, unit_price)
            VALUES (${o.orderId}, ${l.lineNum}, ${l.categoryId}, ${l.productId}, ${l.itemId},
                    ${l.quantity}, ${l.unitPrice})`,
      );
    }
  });
}

export async function getPurchaseOrder(env: TxEnv, orderId: string): Promise<PurchaseOrder> {
  const exists = await env.db.all(sql`SELECT 1 FROM purchase_order WHERE order_id = ${orderId}`);
  if (exists.length === 0) throw new Error(`unknown purchase order: ${orderId}`);
  // A supplier order of the same id has its own contact: leave that one out.
  const contacts = (await env.db.all(
    sql`SELECT contact_id, name, address, email, phone FROM contact_info
        WHERE order_id = ${orderId}
          AND contact_id NOT IN (SELECT contact_id FROM supplier_order)
        ORDER BY contact_id LIMIT 1`,
  )) as (ContactSql & { contact_id: number })[];
  if (contacts.length === 0) throw new Error(`purchase order ${orderId} has no contact`);
  const lines = (await env.db.all(
    sql`SELECT line_num, category_id, product_id, item_id, quantity, unit_price, quantity_shipped
        FROM order_line WHERE order_id = ${orderId} ORDER BY line_num`,
  )) as LineSql[];
  const shipping = toShipping(contacts[0]);
  return {
    orderId: String(orderId),
    billing: { ...shipping },
    shipping,
    contactId: Number(contacts[0].contact_id),
    lines: lines.map(toLineRow),
  };
}

/** The retention purge: each order with its lines, its contact and the address the contact holds. */
export async function purgeSupplierOrders(env: FulfilEnv, orderIds: string[]): Promise<void> {
  await inTransaction(env, async (tx) => {
    for (const id of orderIds) {
      const rows = (await tx.db.all(
        sql`SELECT contact_id FROM supplier_order WHERE order_id = ${id}`,
      )) as { contact_id: number }[];
      await tx.db.run(sql`DELETE FROM supplier_order_line WHERE order_id = ${id}`);
      await tx.db.run(sql`DELETE FROM supplier_order WHERE order_id = ${id}`);
      for (const r of rows) {
        await tx.db.run(sql`DELETE FROM contact_info WHERE contact_id = ${r.contact_id}`);
      }
    }
  });
}

const present = (v: string | undefined) => (v === undefined || v === "" ? undefined : v);

function parseDate(text: string | undefined, now: () => Date): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text ?? "");
  if (m) {
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    if (d.getMonth() === Number(m[2]) - 1 && d.getDate() === Number(m[3])) return d;
  }
  return now();
}

/**
 * Read a SupplierOrder message (design.md P6, SD10). The shipping address is `<Address>`, or
 * approval's `Street1…Country` joined into one line. An unreadable `<OrderDate>` becomes today.
 */
export function parseSupplierOrderMessage(
  xml: string,
  options: { now?: () => Date } = {},
): SupplierOrderInput {
  const orderId = present(xmlText(xml, "OrderId"));
  if (!orderId) throw new Error("the order has no <OrderId>");
  const info = /<ShippingInfo(?:\s[^>]*)?>([\s\S]*?)<\/ShippingInfo>/.exec(xml)?.[1] ?? "";
  const address =
    xmlText(info, "Address") ??
    ["Street1", "Street2", "City", "State", "Zip", "Country"]
      .map((n) => xmlText(info, n))
      .filter((v): v is string => !!v)
      .join(", ");
  const lines: LineItem[] = [];
  for (const m of xml.matchAll(/<LineItem(?:\s[^>]*)?>([\s\S]*?)<\/LineItem>/g)) {
    const itemId = present(xmlText(m[1], "ItemId"));
    const quantity = Number(xmlText(m[1], "Quantity"));
    if (!itemId) throw new Error("a line item has no <ItemId>");
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error(`line item ${itemId} has an invalid <Quantity>`);
    }
    const price = present(xmlText(m[1], "UnitPrice"));
    lines.push({
      categoryId: xmlText(m[1], "CategoryId") ?? null,
      productId: xmlText(m[1], "ProductId") ?? null,
      itemId,
      lineNum: Number(xmlText(m[1], "LineNum") ?? lines.length + 1),
      quantity,
      unitPrice: price === undefined || Number.isNaN(Number(price)) ? null : Number(price),
    });
  }
  if (lines.length === 0) throw new Error("the order has no line item");
  return {
    orderId,
    date: parseDate(xmlText(xml, "OrderDate"), options.now ?? (() => new Date())),
    shipping: {
      name: xmlText(info, "Name") ?? "",
      address,
      email: xmlText(info, "Email") ?? "",
      phone: xmlText(info, "Phone") ?? "",
    },
    lines,
  };
}
