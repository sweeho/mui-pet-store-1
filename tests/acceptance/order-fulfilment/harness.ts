/**
 * Shared fixture for the order-fulfilment acceptance tests. It is also the contract the build
 * must meet; every assumption about names lives here, not in the tests.
 *
 * Product modules (under src/fulfilment/), every function async unless noted; `env` is FulfilEnv
 * (shape built by makeEnv below):
 *  - orders.ts: ORDER_STATUSES (the five values PENDING, APPROVED, DENIED, COMPLETED, SHIPPED_PART);
 *    isOrderStatus(s) (sync); createSupplierOrder(env, {orderId, date: Date, shipping: {name,
 *    address, email, phone}, lines: LineInput[]}) stores it PENDING with one contact_info row and
 *    its supplier_order_line rows; getSupplierOrder(env, id) -> {orderId, date (epoch ms), status,
 *    contactId, shipping, lines: LineRow[]}; getLineItems(env, id) -> LineRow[] as plain objects;
 *    approveOrder(env, id); findOrdersByStatus(env, status) -> orderIds;
 *    listOrderStatus(env) -> [{orderId, userName, date, value, status}] one per order (view over
 *    purchase_order and order_manager); createPurchaseOrder(env, {orderId, userName, shipping,
 *    lines}) also creates the contact_info row; getPurchaseOrder(env, id) -> {orderId, billing,
 *    shipping, contactId, lines}; purgeSupplierOrders(env, orderIds) deletes orders, contacts and
 *    addresses; parseSupplierOrderMessage(xml, {now?}) (sync) -> {orderId, date: Date, lines}, throwing when
 *    there is no line item; unreadable <OrderDate> becomes now().
 *  - documents.ts (all sync): buildSupplierOrderXml(order) -> <SupplierOrder> with <OrderId>,
 *    <OrderDate> (yyyy-MM-dd), <ShippingInfo>, <LineItem> children; buildInvoiceXml({orderId,
 *    userId, orderDate, shippingDate, lines}) -> <Invoice> with <OrderId>, <UserId>, <OrderDate>,
 *    <ShippingDate>, <LineItem> children; toLineItem(row) -> {categoryId, productId, itemId,
 *    lineNum, quantity, unitPrice}; parseDocument(xml, {validate: true}) throws for a document
 *    that breaks its DTD (a DOCTYPE declaring root X whose content model is not met).
 *  - fulfilment.ts: fulfilLine(env, orderId, lineNum) -> {shipped: boolean}; processOrder(env,
 *    orderId) -> {invoice: string | null, status}; processInvoice(env, {orderId, lines:
 *    [{lineNum, shipped}]}) adds to quantity_shipped, sets COMPLETED or SHIPPED_PART and, on
 *    COMPLETED, pushes the orderId on env.completedOrderQueue; receiveSupplierOrder(env, xml)
 *    persists then fulfils each line; processApproval(env, [{orderId, approved}]) pushes
 *    buildSupplierOrderXml text on env.supplierQueue for approved orders only.
 *  - inventory.ts: updateInventory(env, [{itemId, checked, value: string}]) applies only ticked,
 *    non-blank, non-negative integer values and then reprocesses PENDING orders via
 *    env.onReprocess(orderId) before processOrder.
 *  - uidgen.ts: nextId(env, prefix) -> string; throws when env.counterCreation.fail is true.
 * Env hooks: env.invoiceGeneration.fail forces generation to throw; env.callerRole is undefined.
 * Tables (SQLite): purchase_order(order_id, user_name, order_time, locale, total_price, status),
 * order_manager(order_id, status) indexed on status, purchase_order indexed on user_name and
 * order_time, order_status(order_id PK, status NOT NULL varchar(20)), order_line(order_id,
 * line_num, category_id, product_id, item_id, quantity CHECK > 0 integer, unit_price decimal,
 * quantity_shipped; PK(order_id, line_num)), supplier_order(order_id PK, order_date epoch ms,
 * status, contact_id REFERENCES contact_info), supplier_order_line(same columns as order_line,
 * PK(order_id, line_num)), contact_info(contact_id PK, order_id, email), inventory(item_id PK,
 * quantity integer NOT NULL CHECK >= 0), counter(name PK, value integer NOT NULL).
 * Browser: /admin/inventory (signed in at /admin/login) lists rows with inputs name="qty_<itemId>"
 * and name="item_<itemId>" (checkbox) and a submit button; the existing quantity is the row's
 * second cell. POST /api/supplier/purchase-orders (SupplierOrder XML) persists and fulfils;
 * GET /api/supplier/purchase-orders/<id> returns JSON {orderId, status}.
 */
import { sql } from "drizzle-orm";

import { getDb } from "@/db/client";
import type { FulfilEnv } from "@/fulfilment/env";

export type Db = Awaited<ReturnType<typeof getDb>>;

export const NOW = new Date(2026, 10, 18, 9, 0, 0);

export interface TestEnv {
  env: FulfilEnv;
  db: Db;
  completed: string[];
  supplierQueue: string[];
  reprocessed: string[];
  invoiceGeneration: { fail: boolean };
  counterCreation: { fail: boolean };
}

export async function makeEnv(): Promise<TestEnv> {
  const db = await getDb();
  await db.run(sql.raw("PRAGMA foreign_keys = ON"));
  const completed: string[] = [];
  const supplierQueue: string[] = [];
  const reprocessed: string[] = [];
  const invoiceGeneration = { fail: false };
  const counterCreation = { fail: false };
  const env = {
    db,
    now: () => NOW,
    completedOrderQueue: completed,
    supplierQueue,
    onReprocess: (id: string) => reprocessed.push(id),
    invoiceGeneration,
    counterCreation,
    callerRole: undefined,
  } as unknown as FulfilEnv;
  return { env, db, completed, supplierQueue, reprocessed, invoiceGeneration, counterCreation };
}

export async function resetData(db: Db): Promise<void> {
  for (const t of [
    "order_manager",
    "order_status",
    "order_line",
    "supplier_order_line",
    "supplier_order",
    "purchase_order",
    "contact_info",
    "inventory",
    "counter",
  ]) {
    await db.run(sql.raw(`DELETE FROM ${t}`));
  }
}

export const SHIPPING = {
  name: "Ann Buyer",
  address: "1 Main St",
  email: "ann@example.com",
  phone: "555-0100",
};

export interface LineInput {
  lineNum: number;
  categoryId: string;
  productId: string;
  itemId: string;
  quantity: number;
  unitPrice: number;
}

export function line(n: number, item: string, quantity: number, unitPrice = 9.99): LineInput {
  return { lineNum: n, categoryId: "FISH", productId: "FI-SW", itemId: item, quantity, unitPrice };
}

export async function setStock(db: Db, item: string, quantity: number): Promise<void> {
  await db.run(
    sql`INSERT OR REPLACE INTO inventory (item_id, quantity) VALUES (${item}, ${quantity})`,
  );
}

export async function stockOf(db: Db, item: string): Promise<number | undefined> {
  const rows = await db.all<{ quantity: number }>(
    sql`SELECT quantity FROM inventory WHERE item_id = ${item}`,
  );
  return rows[0]?.quantity;
}

export async function rejects(p: Promise<unknown>): Promise<boolean> {
  try {
    await p;
    return false;
  } catch {
    return true;
  }
}

export async function indexedColumns(db: Db, table: string): Promise<string[]> {
  const idx = await db.all<{ name: string }>(sql.raw(`PRAGMA index_list(${table})`));
  const cols: string[] = [];
  for (const i of idx) {
    const info = await db.all<{ name: string }>(sql.raw(`PRAGMA index_info(${i.name})`));
    cols.push(...info.map((c) => c.name));
  }
  return cols;
}

export function supplierOrderXml(id: string, items: [string, number][], date = "2026-11-18") {
  const lines = items
    .map(
      ([item, q], i) =>
        `<LineItem><CategoryId>FISH</CategoryId><ProductId>FI-SW</ProductId><ItemId>${item}</ItemId><LineNum>${i + 1}</LineNum><Quantity>${q}</Quantity><UnitPrice>9.99</UnitPrice></LineItem>`,
    )
    .join("");
  return `<SupplierOrder><OrderId>${id}</OrderId><OrderDate>${date}</OrderDate><ShippingInfo><Name>Ann</Name><Address>1 Main St</Address><Email>a@x.com</Email><Phone>555</Phone></ShippingInfo>${lines}</SupplierOrder>`;
}
