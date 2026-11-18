/** @jest-environment node */
import { sql } from "drizzle-orm";

import { useIsolatedDatabase } from "@/db/isolated";

import { createContact } from "./contact";
import { createCreditCard } from "./credit-card";
import { getCounter, nextIdentifier } from "./ids";
import {
  getOrder,
  persistSequence,
  recordOrder,
  removeCreditCard,
  storeAddress,
  storeCreditCard,
  storePaymentCard,
} from "./store";

const ADDRESS = {
  street1: "1 Main St",
  city: "Springfield",
  state: "CA",
  zip: "90000",
  country: "US",
};
const CARD = { cardNumber: "4111111111111111", cardType: "Visa", expiryDate: "04/2008" };

let db: Awaited<ReturnType<typeof useIsolatedDatabase>>;
beforeAll(async () => {
  db = await useIsolatedDatabase();
});
beforeEach(async () => {
  for (const t of ["checkout_order", "payment_card", "credit_card", "address", "sequence"]) {
    await db.run(sql.raw(`DELETE FROM ${t}`));
  }
});
const count = async (table: string) =>
  Number(((await db.all(sql.raw(`SELECT COUNT(*) AS n FROM ${table}`))) as { n: number }[])[0].n);

const baseOrder = () => ({
  orderId: "10011",
  userId: "j2ee",
  emailAddress: "ann@example.com",
  orderDate: Date.UTC(2026, 10, 18),
  locale: "en_US",
  totalPrice: 42.5,
  contact: createContact({ givenName: "Ann", email: "ann@example.com" }),
  paymentCard: createCreditCard(CARD),
});

describe("checkout store", () => {
  it("[SWHM2-C-0037] addresses get distinct ids and street line 2 is optional", async () => {
    const a = await storeAddress(db, ADDRESS);
    const b = await storeAddress(db, ADDRESS);
    expect(a).not.toEqual(b);
    const rows = (await db.all(sql`SELECT street2 FROM address`)) as { street2: unknown }[];
    expect(rows.map((r) => r.street2 ?? null)).toEqual([null, null]);
  });

  it("[SWHM2-C-0038] an address without city is rejected and leaves no row", async () => {
    await expect(storeAddress(db, { ...ADDRESS, city: undefined } as never)).rejects.toBeDefined();
    expect(await count("address")).toBe(0);
  });

  it("[SWHM2-C-0040] stored credit cards get distinct ids", async () => {
    expect(await storeCreditCard(db, CARD)).not.toEqual(await storeCreditCard(db, CARD));
  });

  it("[SWHM2-C-0041] a card without expiry is rejected and leaves no row", async () => {
    await expect(
      storeCreditCard(db, { cardNumber: "1", cardType: "Visa" } as never),
    ).rejects.toBeDefined();
    expect(await count("credit_card")).toBe(0);
  });

  it("[SWHM2-C-0042] sequence 1001 is persisted as one record with an integer counter", async () => {
    await persistSequence(db, "1001");
    await persistSequence(db, "1001");
    const rows = (await db.all(sql`SELECT name, counter FROM sequence`)) as {
      name: string;
      counter: number;
    }[];
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe("1001");
    expect(Number.isInteger(Number(rows[0].counter))).toBe(true);
  });

  it("[SWHM2-C-0050] sequence 1001 with counter 1 yields 10012", async () => {
    await db.run(sql`INSERT INTO sequence (name, counter) VALUES ('1001', 1)`);
    expect(await nextIdentifier(db, "1001")).toBe("10012");
    expect(await getCounter(db, "1001")).toBe(2);
  });

  it("[SWHM2-C-0051] the first identifier for a new sequence is 10011", async () => {
    expect(await getCounter(db, "1001")).toBeUndefined();
    expect(await nextIdentifier(db, "1001")).toBe("10011");
    expect(await getCounter(db, "1001")).toBe(1);
  });

  it("[SWHM2-C-0055] an order record carries all its fields", async () => {
    const id = await recordOrder(db, {
      ...baseOrder(),
      lineItems: [{ itemId: "EST-1", quantity: 2, unitPrice: 10 }],
    });
    const read = await getOrder(db, id);
    expect(read).toMatchObject({
      orderId: "10011",
      userId: "j2ee",
      emailAddress: "ann@example.com",
      orderDate: Date.UTC(2026, 10, 18),
      locale: "en_US",
      totalPrice: 42.5,
      paymentCard: CARD,
      lineItems: [{ itemId: "EST-1", quantity: 2, unitPrice: 10 }],
    });
    expect(read?.contact.givenName).toBe("Ann");
    expect(await getOrder(db, "nope")).toBeUndefined();
  });

  it("[SWHM2-C-0056] an order without a payment card is rejected and leaves no row", async () => {
    const noCard = { ...baseOrder(), paymentCard: undefined };
    await expect(
      recordOrder(db, {
        ...noCard,
        lineItems: [{ itemId: "EST-1", quantity: 1, unitPrice: 1 }],
      } as never),
    ).rejects.toBeDefined();
    expect(await count("checkout_order")).toBe(0);
    expect(await count("checkout_order_line")).toBe(0);
  });

  it("[SWHM2-C-0061] credit card removal runs in a transaction", async () => {
    const id = await storeCreditCard(db, CARD);
    await expect(
      removeCreditCard(db, id, {
        afterDelete: () => {
          throw new Error("forced failure");
        },
      }),
    ).rejects.toThrow("forced failure");
    expect(await count("credit_card")).toBe(1);
    await removeCreditCard(db, id, {});
    expect(await count("credit_card")).toBe(0);
  });

  it("[SWHM2-C-0063] a payment card is stored with a clear-text number", async () => {
    await storePaymentCard(db, {
      cardNumber: "4111111111111111",
      cardType: "Visa",
      expiryDate: "04/04",
    });
    const rows = (await db.all(
      sql`SELECT card_number, card_type, expiry_date FROM payment_card`,
    )) as Record<string, string>[];
    expect(rows).toEqual([
      { card_number: "4111111111111111", card_type: "Visa", expiry_date: "04/04" },
    ]);
  });
});
