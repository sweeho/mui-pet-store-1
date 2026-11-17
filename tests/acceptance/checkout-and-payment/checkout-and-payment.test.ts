/** @jest-environment node */
import { getDb } from "@/db/client";
import { invokeCreditCardOperation } from "@/checkout/access";
import { createContact } from "@/checkout/contact";
import { createCreditCard, getExpiryMonth, getExpiryYear } from "@/checkout/credit-card";
import {
  addressFromElement,
  contactFromDocument,
  creditCardFromDocument,
  creditCardToDocument,
  purchaseOrderToDocument,
} from "@/checkout/documents";
import { getCounter, nextIdentifier } from "@/checkout/ids";
import {
  getOrder,
  persistSequence,
  recordOrder,
  removeCreditCard,
  storeAddress,
  storeCreditCard,
  storePaymentCard,
} from "@/checkout/store";
import { sql } from "drizzle-orm";
import { ADDRESS, CARD, CONTACT_XML, type Db, childNames, count, resetData } from "./harness";

let db: Db;

beforeAll(async () => {
  db = await getDb();
});

beforeEach(async () => {
  await resetData(db);
});

describe("checkout-and-payment", () => {
  // case: SWHM2-C-0037@v1
  it("SWHM2-C-0037 addresses get distinct ids and street line 2 is optional", async () => {
    const a = await storeAddress(db, { ...ADDRESS });
    const b = await storeAddress(db, { ...ADDRESS });
    expect(a).toBeDefined();
    expect(b).toBeDefined();
    expect(a).not.toEqual(b);
    const rows = (await db.all(sql`SELECT street2 FROM address`)) as { street2: unknown }[];
    expect(rows).toHaveLength(2);
    for (const r of rows) expect(r.street2 ?? null).toBeNull();
  });

  // case: SWHM2-C-0038@v1
  it("SWHM2-C-0038 an address without city is rejected", async () => {
    const { city: _city, ...noCity } = ADDRESS;
    await expect(storeAddress(db, noCity as never)).rejects.toBeDefined();
    expect(await count(db, "address")).toBe(0);
  });

  // case: SWHM2-C-0039@v1
  it("SWHM2-C-0039 credit card holds number, type and expiry as text", () => {
    const card = createCreditCard({ ...CARD });
    expect(typeof card.cardNumber).toBe("string");
    expect(typeof card.cardType).toBe("string");
    expect(typeof card.expiryDate).toBe("string");
  });

  // case: SWHM2-C-0040@v1
  it("SWHM2-C-0040 stored credit cards get unique ids", async () => {
    const a = await storeCreditCard(db, { ...CARD });
    const b = await storeCreditCard(db, { ...CARD });
    expect(a).toBeDefined();
    expect(b).toBeDefined();
    expect(a).not.toEqual(b);
  });

  // case: SWHM2-C-0041@v1
  it("SWHM2-C-0041 a card without expiry is rejected", async () => {
    await expect(
      storeCreditCard(db, { cardNumber: CARD.cardNumber, cardType: CARD.cardType } as never),
    ).rejects.toBeDefined();
    expect(await count(db, "credit_card")).toBe(0);
  });

  // case: SWHM2-C-0042@v1
  it("SWHM2-C-0042 sequence 1001 is persisted as one record with an integer counter", async () => {
    await persistSequence(db, "1001");
    const rows = (await db.all(sql`SELECT name, counter FROM sequence`)) as {
      name: string;
      counter: number;
    }[];
    expect(rows).toHaveLength(1);
    expect(String(rows[0].name)).toBe("1001");
    expect(Number.isInteger(Number(rows[0].counter))).toBe(true);
  });

  // case: SWHM2-C-0043@v1
  it("SWHM2-C-0043 a ContactInfo document builds a contact", () => {
    const c = contactFromDocument(CONTACT_XML);
    expect(c.givenName).toBe("Ann");
    expect(c.familyName).toBe("Lee");
    expect(c.telephone).toBe("555-0100");
    expect(c.email).toBe("ann@example.com");
    expect(c.address.city).toBe("Springfield");
  });

  // case: SWHM2-C-0044@v1
  it("SWHM2-C-0044 a document whose root is not ContactInfo is rejected", () => {
    expect(() => contactFromDocument("<Other><GivenName>Ann</GivenName></Other>")).toThrow();
  });

  // case: SWHM2-C-0045@v1
  it("SWHM2-C-0045 a contact created with no data has an empty address", () => {
    const c = createContact();
    expect(c.address).toBeDefined();
    expect(c.address).not.toBeNull();
    for (const v of Object.values(c.address as Record<string, unknown>)) {
      expect(v === undefined || v === null || v === "").toBe(true);
    }
  });

  // case: SWHM2-C-0046@v1
  it("SWHM2-C-0046 an Address element is read and street line 2 is optional", () => {
    const full =
      "<Address><Street1>1 Main St</Street1><Street2>Apt 2</Street2><City>Springfield</City><State>CA</State><Zip>90000</Zip><Country>US</Country></Address>";
    const bare =
      "<Address><Street1>1 Main St</Street1><City>Springfield</City><State>CA</State><Zip>90000</Zip><Country>US</Country></Address>";
    expect(addressFromElement(full).street2).toBe("Apt 2");
    const a = addressFromElement(bare);
    expect(a.city).toBe("Springfield");
    expect(a.street2 ?? "").toBe("");
  });

  // case: SWHM2-C-0047@v1
  it("SWHM2-C-0047 an element not named Address is rejected", () => {
    expect(() =>
      addressFromElement("<Place><Street1>1 Main St</Street1><City>X</City></Place>"),
    ).toThrow();
  });

  // case: SWHM2-C-0048@v1
  it("SWHM2-C-0048 a credit card is written with children in order", () => {
    const xml = creditCardToDocument(createCreditCard({ ...CARD }));
    expect(childNames(xml)).toEqual(["CardNumber", "CardType", "ExpiryDate"]);
  });

  // case: SWHM2-C-0049@v1
  it("SWHM2-C-0049 a document whose root is not CreditCard is rejected", () => {
    expect(() => creditCardFromDocument("<Other><CardNumber>1</CardNumber></Other>")).toThrow();
  });

  // case: SWHM2-C-0050@v1
  it("SWHM2-C-0050 sequence 1001 with counter 1 yields 10012", async () => {
    await db.run(sql`INSERT INTO sequence (name, counter) VALUES ('1001', 1)`);
    expect(await nextIdentifier(db, "1001")).toBe("10012");
    expect(Number(await getCounter(db, "1001"))).toBe(2);
  });

  // case: SWHM2-C-0051@v1
  it("SWHM2-C-0051 the first identifier for a new sequence is 10011", async () => {
    expect(await getCounter(db, "1001")).toBeUndefined();
    expect(await nextIdentifier(db, "1001")).toBe("10011");
    expect(Number(await getCounter(db, "1001"))).toBe(1);
  });

  // case: SWHM2-C-0052@v1
  it("SWHM2-C-0052 missing or slashless expiry gives month 01 and year 2010", () => {
    const none = createCreditCard({ cardNumber: "1", cardType: "Visa" } as never);
    const slashless = createCreditCard({ ...CARD, expiryDate: "0408" });
    for (const c of [none, slashless]) {
      expect(getExpiryMonth(c)).toBe("01");
      expect(getExpiryYear(c)).toBe("2010");
    }
  });

  // case: SWHM2-C-0053@v1
  it("SWHM2-C-0053 an empty email is accepted when reading a contact", () => {
    const xml = CONTACT_XML.replace("<Email>ann@example.com</Email>", "<Email></Email>");
    const c = contactFromDocument(xml);
    expect(c.email).toBe("");
  });

  // case: SWHM2-C-0055@v1
  it("SWHM2-C-0055 an order record carries all its fields", async () => {
    const order = {
      orderId: "1001",
      userId: "j2ee",
      emailAddress: "ann@example.com",
      orderDate: new Date(2026, 10, 18).getTime(),
      locale: "en_US",
      totalPrice: 42.5,
      contact: contactFromDocument(CONTACT_XML),
      paymentCard: createCreditCard({ ...CARD }),
    };
    const id = await recordOrder(db, order);
    const read = (await getOrder(db, id ?? order.orderId)) as Record<string, unknown>;
    expect(read.orderId).toBeDefined();
    expect(read.userId).toBe("j2ee");
    expect(read.emailAddress).toBe("ann@example.com");
    expect(read.orderDate).toBeDefined();
    expect(read.locale).toBe("en_US");
    expect(Number(read.totalPrice)).toBe(42.5);
    expect(read.contact).toBeDefined();
    expect(read.paymentCard).toBeDefined();
  });

  // case: SWHM2-C-0056@v1
  it("SWHM2-C-0056 an order without a payment card is rejected", async () => {
    const order = {
      orderId: "1002",
      userId: "j2ee",
      emailAddress: "ann@example.com",
      orderDate: Date.now(),
      locale: "en_US",
      totalPrice: 1,
      contact: contactFromDocument(CONTACT_XML),
    };
    await expect(recordOrder(db, order as never)).rejects.toBeDefined();
    expect(await count(db, "checkout_order")).toBe(0);
  });

  // case: SWHM2-C-0057@v1
  it("SWHM2-C-0057 expiry 04/2008 splits into month 04 and year 2008", () => {
    const c = createCreditCard({ ...CARD, expiryDate: "04/2008" });
    expect(getExpiryMonth(c)).toBe("04");
    expect(getExpiryYear(c)).toBe("2008");
  });

  // case: SWHM2-C-0058@v1
  it("SWHM2-C-0058 a card is created from number, type and expiry", () => {
    const c = createCreditCard({ cardNumber: "123", cardType: "Amex", expiryDate: "01/2030" });
    expect(c.cardNumber).toBe("123");
    expect(c.cardType).toBe("Amex");
    expect(c.expiryDate).toBe("01/2030");
  });

  // case: SWHM2-C-0059@v1
  it("SWHM2-C-0059 a card is created from an existing data object", () => {
    const source = { cardNumber: "999", cardType: "Visa", expiryDate: "12/2031" };
    const c = createCreditCard(source);
    expect(c.cardNumber).toBe("999");
    expect(c.cardType).toBe("Visa");
    expect(c.expiryDate).toBe("12/2031");
  });

  // case: SWHM2-C-0060@v1
  it("SWHM2-C-0060 an unauthenticated caller may invoke a card operation", async () => {
    for (const op of ["find", "create", "remove"]) {
      const r = await invokeCreditCardOperation(op, {});
      expect(r.permitted).toBe(true);
    }
  });

  // case: SWHM2-C-0061@v1
  it("SWHM2-C-0061 credit card removal runs in a transaction", async () => {
    const id = await storeCreditCard(db, { ...CARD });
    await expect(
      removeCreditCard(db, id, {
        afterDelete: () => {
          throw new Error("forced failure");
        },
      }),
    ).rejects.toThrow();
    expect(await count(db, "credit_card")).toBe(1);
    await removeCreditCard(db, id, {});
    expect(await count(db, "credit_card")).toBe(0);
  });

  // case: SWHM2-C-0062@v1
  it("SWHM2-C-0062 a purchase order document has all parts and a line item", () => {
    const xml = purchaseOrderToDocument({
      orderId: "1001",
      userId: "j2ee",
      emailAddress: "ann@example.com",
      orderDate: Date.UTC(2026, 10, 18),
      locale: "en_US",
      totalPrice: 10,
      contact: contactFromDocument(CONTACT_XML),
      paymentCard: createCreditCard({ ...CARD }),
      lineItems: [{ itemId: "EST-1", quantity: 1, unitPrice: 10 }],
    } as never);
    expect(childNames(xml)).toEqual(
      expect.arrayContaining([
        "OrderId",
        "UserId",
        "EmailAddress",
        "OrderDate",
        "Locale",
        "TotalPrice",
        "ShippingInfo",
        "CreditCard",
        "LineItems",
      ]),
    );
    expect(xml).toMatch(/<LineItem[ >]/);
  });

  // case: SWHM2-C-0063@v1
  it("SWHM2-C-0063 a payment card is stored with a clear-text number", async () => {
    await storePaymentCard(db, {
      cardNumber: "4111111111111111",
      cardType: "Visa",
      expiryDate: "04/04",
    });
    const rows = (await db.all(
      sql`SELECT card_number, card_type, expiry_date FROM payment_card`,
    )) as { card_number: string; card_type: string; expiry_date: string }[];
    expect(rows).toHaveLength(1);
    expect(rows[0].card_number).toBe("4111111111111111");
    expect(rows[0].card_type).toBe("Visa");
    expect(rows[0].expiry_date).toBe("04/04");
  });
});
