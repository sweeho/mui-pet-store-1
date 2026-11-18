import { sql } from "drizzle-orm";

import type { ApprovalEnv } from "./env";
import { escapeXml } from "./documents";

const el = (name: string, value: string | number | null | undefined) =>
  `<${name}>${escapeXml(value === null || value === undefined ? "" : String(value))}</${name}>`;

type ShipTo = {
  givenName?: string;
  familyName?: string;
  address?: Record<string, string | null | undefined>;
};

/** The shipping info of the checkout order of the same id, or empty when there is none. */
async function shippingInfo(env: ApprovalEnv, orderId: string): Promise<string> {
  const rows = (await env.db.all(
    sql`SELECT ship_to FROM checkout_order WHERE order_id = ${orderId}`,
  )) as { ship_to: string }[];
  if (rows.length === 0) return "<ShippingInfo></ShippingInfo>";
  let ship: ShipTo = {};
  try {
    ship = JSON.parse(rows[0].ship_to) as ShipTo;
  } catch {
    // An unreadable ship-to is left empty rather than blocking the supplier order.
  }
  const a = ship.address ?? {};
  return `<ShippingInfo>${el("Name", `${ship.givenName ?? ""} ${ship.familyName ?? ""}`.trim())}${el("Street1", a.street1)}${el("Street2", a.street2)}${el("City", a.city)}${el("State", a.state)}${el("Zip", a.zip)}${el("Country", a.country)}</ShippingInfo>`;
}

/** The supplier purchase order of an approved order (design.md P7). */
export async function buildSupplierOrderXml(env: ApprovalEnv, orderId: string): Promise<string> {
  const orders = (await env.db.all(
    sql`SELECT order_time FROM purchase_order WHERE order_id = ${orderId}`,
  )) as { order_time: number | bigint }[];
  const date = orders[0] ? new Date(Number(orders[0].order_time)).toISOString().slice(0, 10) : "";
  const lines = (await env.db.all(
    sql`SELECT line_num, category_id, product_id, item_id, quantity, unit_price
        FROM order_line WHERE order_id = ${orderId} ORDER BY line_num`,
  )) as {
    line_num: number;
    category_id: string | null;
    product_id: string | null;
    item_id: string;
    quantity: number;
    unit_price: number | null;
  }[];
  const items = lines
    .map(
      (l) =>
        `<LineItem>${el("CategoryId", l.category_id)}${el("ProductId", l.product_id)}${el("ItemId", l.item_id)}${el("LineNum", l.line_num)}${el("Quantity", l.quantity)}${el("UnitPrice", l.unit_price)}</LineItem>`,
    )
    .join("");
  return `<SupplierOrder>${el("OrderId", orderId)}${el("OrderDate", date)}${await shippingInfo(env, orderId)}${items}</SupplierOrder>`;
}
