import { sql } from "drizzle-orm";

import { buildInvoiceXml, buildSupplierOrderXml, type LineItem, type Shipping } from "./documents";
import { inTransaction, type FulfilEnv, type TxEnv } from "./env";
import {
  createSupplierOrder,
  getSupplierOrder,
  parseSupplierOrderMessage,
  setSupplierStatus,
} from "./orders";

class InvoiceFailure extends Error {}

type LineSql = { quantity: number; quantity_shipped: number; item_id: string };

/**
 * Ship one line from stock, whole or not at all (design.md P4). A line already fully shipped is
 * skipped and stock is not touched. The conditional update covers too little stock and an item
 * with no inventory row alike: no row changes, so the line does not ship.
 */
async function shipLine(env: TxEnv, orderId: string, lineNum: number): Promise<boolean> {
  const rows = (await env.db.all(
    sql`SELECT quantity, quantity_shipped, item_id FROM supplier_order_line
        WHERE order_id = ${orderId} AND line_num = ${lineNum}`,
  )) as LineSql[];
  if (rows.length === 0) throw new Error(`order ${orderId} has no line ${lineNum}`);
  const line = rows[0];
  // Only what an earlier invoice has not shipped is taken from stock.
  const remaining = Number(line.quantity) - Number(line.quantity_shipped);
  if (remaining <= 0) return false;
  const taken = await env.db.all(
    sql`UPDATE inventory SET quantity = quantity - ${remaining}
        WHERE item_id = ${line.item_id} AND quantity >= ${remaining} RETURNING item_id`,
  );
  if (taken.length === 0) return false;
  await env.db.run(
    sql`UPDATE supplier_order_line SET quantity_shipped = quantity
        WHERE order_id = ${orderId} AND line_num = ${lineNum}`,
  );
  return true;
}

export async function fulfilLine(
  env: FulfilEnv,
  orderId: string,
  lineNum: number,
): Promise<{ shipped: boolean }> {
  return { shipped: await inTransaction(env, (tx) => shipLine(tx, orderId, lineNum)) };
}

const unshippedCount = async (env: TxEnv, orderId: string) =>
  Number(
    (
      (await env.db.all(
        sql`SELECT COUNT(*) AS n FROM supplier_order_line
            WHERE order_id = ${orderId} AND quantity_shipped < quantity`,
      )) as { n: number }[]
    )[0].n,
  );

/**
 * One fulfilment run (design.md P4): try each unshipped line, build one invoice of the lines that
 * shipped, and complete the order when every line has shipped. It is one transaction, so an
 * invoice failure undoes the run's stock and line writes and returns no invoice (R-0084). An
 * order that is not fully shipped keeps its status (SD2).
 */
export async function processOrder(
  env: FulfilEnv,
  orderId: string,
): Promise<{ invoice: string | null; status: string }> {
  const order = await getSupplierOrder(env, orderId);
  // Only an order still waiting to ship is processed; a DENIED or COMPLETED one is left alone.
  if (!["PENDING", "APPROVED", "SHIPPED_PART"].includes(order.status)) {
    return { invoice: null, status: order.status };
  }
  try {
    const run = await inTransaction(env, async (tx) => {
      const shipped: LineItem[] = [];
      for (const l of order.lines) {
        const current = (await getSupplierOrder(tx, orderId)).lines.find(
          (x) => x.lineNum === l.lineNum,
        );
        if (current && current.quantityShipped < current.quantity) {
          if (await shipLine(tx, orderId, l.lineNum)) {
            shipped.push({ ...current, quantity: current.quantity - current.quantityShipped });
          }
        }
      }
      let invoice: string | null = null;
      if (shipped.length > 0) {
        if (env.invoiceGeneration?.fail) throw new InvoiceFailure("invoice generation failed");
        const owner = (await tx.db.all(
          sql`SELECT user_name FROM purchase_order WHERE order_id = ${orderId}`,
        )) as { user_name: string }[];
        invoice = buildInvoiceXml({
          orderId,
          userId: owner[0]?.user_name ?? "",
          orderDate: new Date(order.date),
          shippingDate: env.now(),
          lines: shipped,
        });
      }
      let status = (await getSupplierOrder(tx, orderId)).status;
      let completedNow = false;
      if ((await unshippedCount(tx, orderId)) === 0 && status !== "COMPLETED") {
        await setSupplierStatus(tx, orderId, "COMPLETED");
        status = "COMPLETED";
        completedNow = true;
      }
      return { invoice, status, completedNow };
    });
    if (run.invoice !== null) env.invoiceQueue?.push(run.invoice);
    if (run.completedNow) env.completedOrderQueue.push(orderId);
    return { invoice: run.invoice, status: run.status };
  } catch (e) {
    if (e instanceof InvoiceFailure) return { invoice: null, status: order.status };
    throw e;
  }
}

/**
 * An invoice received from elsewhere (design.md P5, SD2): add each named line's shipped quantity.
 * Every line shipped completes the order and notifies; otherwise it becomes SHIPPED_PART.
 */
export async function processInvoice(
  env: FulfilEnv,
  invoice: { orderId: string; lines: { lineNum: number; shipped: number }[] },
): Promise<void> {
  const status = await inTransaction(env, async (tx) => {
    for (const l of invoice.lines) {
      await tx.db.run(
        sql`UPDATE supplier_order_line SET quantity_shipped = quantity_shipped + ${l.shipped}
            WHERE order_id = ${invoice.orderId} AND line_num = ${l.lineNum}`,
      );
    }
    const next = (await unshippedCount(tx, invoice.orderId)) === 0 ? "COMPLETED" : "SHIPPED_PART";
    await setSupplierStatus(tx, invoice.orderId, next);
    return next;
  });
  if (status === "COMPLETED") env.completedOrderQueue.push(invoice.orderId);
}

/** Persist a received supplier purchase order, then try to fulfil it. Resolves to its id. */
export async function receiveSupplierOrder(env: FulfilEnv, xml: string): Promise<string> {
  const order = parseSupplierOrderMessage(xml, { now: env.now });
  await createSupplierOrder(env, order);
  await processOrder(env, order.orderId);
  return order.orderId;
}

type CheckoutShip = {
  givenName?: string;
  familyName?: string;
  address?: Record<string, string | null | undefined>;
};

/** The shipping contact of the checkout order of the same id, or an empty one. */
async function shippingOf(env: TxEnv, orderId: string): Promise<Shipping> {
  const rows = (await env.db.all(
    sql`SELECT ship_to, email_address FROM checkout_order WHERE order_id = ${orderId}`,
  )) as { ship_to: string; email_address: string }[];
  const empty = { name: "", address: "", email: "", phone: "" };
  if (rows.length === 0) return empty;
  let ship: CheckoutShip = {};
  try {
    ship = JSON.parse(rows[0].ship_to) as CheckoutShip;
  } catch {
    // An unreadable ship-to is left empty rather than blocking the supplier order.
  }
  const a = ship.address ?? {};
  return {
    name: `${ship.givenName ?? ""} ${ship.familyName ?? ""}`.trim(),
    address: [a.street1, a.street2, a.city, a.state, a.zip, a.country].filter(Boolean).join(", "),
    email: rows[0].email_address,
    phone: "",
  };
}

/**
 * A supplier purchase order for each approved decision and none for a denied one (R-0101). It is
 * built from the customer order's rows when they exist, else from the id alone (design.md P7).
 */
export async function processApproval(
  env: FulfilEnv,
  decisions: { orderId: string; approved: boolean }[],
): Promise<void> {
  for (const d of decisions) {
    if (!d.approved) continue;
    const orders = (await env.db.all(
      sql`SELECT order_time FROM purchase_order WHERE order_id = ${d.orderId}`,
    )) as { order_time: number }[];
    const lines = (await env.db.all(
      sql`SELECT line_num, category_id, product_id, item_id, quantity, unit_price
          FROM order_line WHERE order_id = ${d.orderId} ORDER BY line_num`,
    )) as {
      line_num: number;
      category_id: string | null;
      product_id: string | null;
      item_id: string;
      quantity: number;
      unit_price: number | null;
    }[];
    env.supplierQueue.push(
      buildSupplierOrderXml({
        orderId: d.orderId,
        date: orders[0] ? new Date(Number(orders[0].order_time)) : env.now(),
        shipping: await shippingOf(env, d.orderId),
        lines: lines.map((l) => ({
          categoryId: l.category_id,
          productId: l.product_id,
          itemId: l.item_id,
          lineNum: Number(l.line_num),
          quantity: Number(l.quantity),
          unitPrice: l.unit_price,
        })),
      }),
    );
  }
}
