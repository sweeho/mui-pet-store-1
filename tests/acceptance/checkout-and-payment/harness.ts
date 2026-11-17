/**
 * Shared fixture for the checkout-and-payment acceptance tests. It is also the contract the build
 * must meet; every assumption about names lives here, not in the tests.
 *
 * Product modules (under src/checkout/):
 *  - credit-card.ts (sync): createCreditCard({ cardNumber, cardType, expiryDate }) -> card with
 *    those three text fields; createCreditCard(existingCard) copies an existing card object.
 *    getExpiryMonth(card) / getExpiryYear(card) split expiryDate on the first "/"; with no expiry
 *    or no slash they return "01" and "2010".
 *  - contact.ts (sync): createContact(data?) -> contact whose `address` is an empty address record
 *    when no data is given.
 *  - documents.ts (sync; every reader throws on a wrong root element):
 *      contactFromDocument(xml) reads <ContactInfo> with children in the defined order
 *        (GivenName, FamilyName, Telephone, Email, Address) -> { givenName, familyName, telephone,
 *        email, address }; an empty element reads as "" with no validation;
 *      addressFromElement(xml) reads <Address> (Street1, Street2?, City, State, Zip, Country) ->
 *        { street1, street2, city, state, zip, country }, street2 "" when absent;
 *      creditCardToDocument(card) -> <CreditCard><CardNumber/><CardType/><ExpiryDate/></CreditCard>;
 *      creditCardFromDocument(xml) -> card;
 *      purchaseOrderToDocument(po) -> <PurchaseOrder> with OrderId, UserId, EmailAddress, OrderDate,
 *        Locale, TotalPrice, ShippingInfo/ContactInfo, CreditCard and LineItems.
 *  - store.ts (async, first argument the Drizzle db; a rejected store rejects the promise and
 *    leaves no row): storeAddress(db, addr) -> addressId; storeCreditCard(db, card) -> cardId;
 *    removeCreditCard(db, cardId, { afterDelete? }) runs in one transaction, a throw from
 *    afterDelete rolls the delete back; storePaymentCard(db, card) -> id; recordOrder(db, order)
 *    -> orderId (rejects without a paymentCard); getOrder(db, orderId); persistSequence(db, name).
 *  - ids.ts: nextIdentifier(db, name) -> name + incremented counter, creating the counter at 0
 *    when absent; getCounter(db, name) -> integer | undefined.
 *  - access.ts: invokeCreditCardOperation(op, { credentials? }) -> { permitted: boolean }.
 * Tables (SQLite): address(address_id, street1, street2, city, state, zip, country),
 * credit_card(card_id, card_number, card_type, expiry_date), payment_card(id, card_number,
 * card_type, expiry_date), sequence(name, counter), checkout_order(order_id, ...).
 * Route handlers: POST /api/checkout/orders { items: string[] } submits the signed-in customer's
 * order and answers { orderId }; GET /api/checkout/orders/{id} answers the order with `paymentCard`.
 */
import { sql } from "drizzle-orm";

import { getDb } from "@/db/client";

export type Db = Awaited<ReturnType<typeof getDb>>;

export async function resetData(db: Db): Promise<void> {
  for (const t of ["checkout_order", "payment_card", "credit_card", "address", "sequence"]) {
    await db.run(sql.raw(`DELETE FROM ${t}`));
  }
}

export async function count(db: Db, table: string): Promise<number> {
  const rows = (await db.all(sql.raw(`SELECT COUNT(*) AS n FROM ${table}`))) as { n: number }[];
  return Number(rows[0].n);
}

export const ADDRESS = {
  street1: "1 Main St",
  city: "Springfield",
  state: "CA",
  zip: "90000",
  country: "US",
};

export const CARD = { cardNumber: "4111111111111111", cardType: "Visa", expiryDate: "04/2008" };

export const CONTACT_XML =
  "<ContactInfo><GivenName>Ann</GivenName><FamilyName>Lee</FamilyName><Telephone>555-0100</Telephone>" +
  "<Email>ann@example.com</Email>" +
  "<Address><Street1>1 Main St</Street1><City>Springfield</City><State>CA</State><Zip>90000</Zip><Country>US</Country></Address>" +
  "</ContactInfo>";

/** Names of the direct children of the root element, in order (no DOM in the node environment). */
export function childNames(xml: string): string[] {
  const body = xml.replace(/<\?xml[^>]*\?>/, "").trim();
  const inner = body.slice(body.indexOf(">") + 1, body.lastIndexOf("</"));
  const names: string[] = [];
  let depth = 0;
  for (const m of inner.matchAll(/<(\/?)([A-Za-z][\w.-]*)[^>]*?(\/?)>/g)) {
    if (m[1]) depth -= 1;
    else {
      if (depth === 0) names.push(m[2]);
      if (!m[3]) depth += 1;
    }
  }
  return names;
}
