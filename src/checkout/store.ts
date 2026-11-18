import { sql } from "drizzle-orm";

import type { Db, Exec } from "@/accounts/store";

import { type Address, type Contact, emptyAddress } from "./contact";

export type AddressInput = {
  street1: string;
  street2?: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
};

export type CardInput = { cardNumber: string; cardType: string; expiryDate: string };

/** Store an address; resolves its id. A missing required field rejects and leaves no row. */
export async function storeAddress(db: Exec, a: AddressInput): Promise<number> {
  const rows = (await db.all(
    sql`INSERT INTO address (street1, street2, city, state, zip, country)
        VALUES (${a.street1 ?? null}, ${a.street2 ?? null}, ${a.city ?? null}, ${a.state ?? null},
                ${a.zip ?? null}, ${a.country ?? null})
        RETURNING address_id AS id`,
  )) as { id: number | bigint }[];
  return Number(rows[0].id);
}

/** Store a credit card; resolves its id. A missing required field rejects and leaves no row. */
export async function storeCreditCard(db: Exec, c: CardInput): Promise<number> {
  const rows = (await db.all(
    sql`INSERT INTO credit_card (card_number, card_type, expiry_date)
        VALUES (${c.cardNumber ?? null}, ${c.cardType ?? null}, ${c.expiryDate ?? null})
        RETURNING card_id AS id`,
  )) as { id: number | bigint }[];
  return Number(rows[0].id);
}

export type OrderLine = { itemId: string; quantity: number; unitPrice: number };

export type Order = {
  orderId: string;
  userId: string;
  emailAddress: string;
  orderDate: number;
  locale: string;
  totalPrice: number;
  contact: Contact;
  /** The billing address; the contact's address when absent. */
  billTo?: Address;
  paymentCard: CardInput;
  enteredCardId?: number | null;
  lineItems?: OrderLine[];
};

/** Delete a credit card and run `afterDelete` in one transaction: a throw rolls the delete back. */
export async function removeCreditCard(
  db: Db,
  id: number,
  { afterDelete }: { afterDelete?: () => void | Promise<void> } = {},
): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.run(sql`DELETE FROM credit_card WHERE card_id = ${id}`);
    await afterDelete?.();
  });
}

/** Store a payment card, number in clear text (R-0158); resolves its id. */
export async function storePaymentCard(db: Exec, c: CardInput): Promise<number> {
  const rows = (await db.all(
    sql`INSERT INTO payment_card (card_number, card_type, expiry_date)
        VALUES (${c.cardNumber ?? null}, ${c.cardType ?? null}, ${c.expiryDate ?? null})
        RETURNING id`,
  )) as { id: number | bigint }[];
  return Number(rows[0].id);
}

/** Persist the sequence `name` at counter 0 unless it exists. */
export async function persistSequence(db: Exec, name: string): Promise<void> {
  await db.run(
    sql`INSERT INTO sequence (name, counter) VALUES (${name}, 0) ON CONFLICT(name) DO NOTHING`,
  );
}

/** Record an order and its lines; an order without a payment card rejects and leaves no row. */
export async function recordOrder(db: Db, o: Order): Promise<string> {
  const card = o.paymentCard as CardInput | undefined;
  const billTo = o.billTo ?? o.contact.address;
  await db.transaction(async (tx) => {
    await tx.run(
      sql`INSERT INTO checkout_order (order_id, user_id, email_address, order_date, locale,
            total_price, ship_to, bill_to, card_number, card_type, expiry_date, entered_card_id)
          VALUES (${o.orderId}, ${o.userId}, ${o.emailAddress}, ${o.orderDate}, ${o.locale},
            ${o.totalPrice}, ${JSON.stringify(o.contact)}, ${JSON.stringify(billTo)},
            ${card?.cardNumber ?? null}, ${card?.cardType ?? null}, ${card?.expiryDate ?? null},
            ${o.enteredCardId ?? null})`,
    );
    let lineNo = 0;
    for (const l of o.lineItems ?? []) {
      lineNo += 1;
      await tx.run(
        sql`INSERT INTO checkout_order_line (order_id, line_no, item_id, quantity, unit_price)
            VALUES (${o.orderId}, ${lineNo}, ${l.itemId}, ${l.quantity}, ${l.unitPrice})`,
      );
    }
  });
  return o.orderId;
}

type OrderRow = {
  order_id: string;
  user_id: string;
  email_address: string;
  order_date: number | bigint;
  locale: string;
  total_price: number;
  ship_to: string;
  bill_to: string;
  card_number: string;
  card_type: string;
  expiry_date: string;
};

/** A placed order with its lines; never the card the customer entered (design.md P7). */
export async function getOrder(db: Exec, id: string): Promise<Order | undefined> {
  const rows = (await db.all(
    sql`SELECT * FROM checkout_order WHERE order_id = ${id}`,
  )) as OrderRow[];
  if (rows.length === 0) return undefined;
  const r = rows[0];
  const lines = (await db.all(
    sql`SELECT item_id, quantity, unit_price FROM checkout_order_line
        WHERE order_id = ${id} ORDER BY line_no`,
  )) as { item_id: string; quantity: number | bigint; unit_price: number }[];
  return {
    orderId: r.order_id,
    userId: r.user_id,
    emailAddress: r.email_address,
    orderDate: Number(r.order_date),
    locale: r.locale,
    totalPrice: Number(r.total_price),
    contact: JSON.parse(r.ship_to) as Contact,
    billTo: { ...emptyAddress(), ...(JSON.parse(r.bill_to) as Address) },
    paymentCard: { cardNumber: r.card_number, cardType: r.card_type, expiryDate: r.expiry_date },
    lineItems: lines.map((l) => ({
      itemId: l.item_id,
      quantity: Number(l.quantity),
      unitPrice: Number(l.unit_price),
    })),
  };
}
