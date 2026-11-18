import { createCreditCard } from "./credit-card";
import {
  addressFromElement,
  contactFromDocument,
  creditCardFromDocument,
  creditCardToDocument,
  purchaseOrderToDocument,
} from "./documents";

const ADDR =
  "<Address><Street1>1 Main St</Street1><City>Springfield</City><State>CA</State><Zip>90000</Zip><Country>US</Country></Address>";
const CONTACT = `<ContactInfo><GivenName>Ann</GivenName><FamilyName>Lee</FamilyName><Telephone>555-0100</Telephone><Email>ann@example.com</Email>${ADDR}</ContactInfo>`;
const CARD = { cardNumber: "4111111111111111", cardType: "Visa", expiryDate: "04/2008" };

/** Names of the root's direct children, in order. */
function childNames(xml: string): string[] {
  const inner = xml.slice(xml.indexOf(">") + 1, xml.lastIndexOf("</"));
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

describe("documents", () => {
  it("[SWHM2-C-0043] a ContactInfo document builds a contact", () => {
    const c = contactFromDocument(CONTACT);
    expect([c.givenName, c.familyName, c.telephone, c.email, c.address.city]).toEqual([
      "Ann",
      "Lee",
      "555-0100",
      "ann@example.com",
      "Springfield",
    ]);
  });

  it("[SWHM2-C-0044] a document whose root is not ContactInfo is rejected", () => {
    expect(() => contactFromDocument("<Other><GivenName>Ann</GivenName></Other>")).toThrow();
  });

  it("[SWHM2-C-0053] an empty e-mail is accepted", () => {
    const c = contactFromDocument(
      CONTACT.replace("<Email>ann@example.com</Email>", "<Email></Email>"),
    );
    expect(c.email).toBe("");
    expect(
      contactFromDocument(CONTACT.replace("<Email>ann@example.com</Email>", "<Email/>")).email,
    ).toBe("");
  });

  it("[SWHM2-C-0046] an Address element is read and street line 2 is optional", () => {
    expect(
      addressFromElement(ADDR.replace("<City>", "<Street2>Apt 2</Street2><City>")).street2,
    ).toBe("Apt 2");
    const a = addressFromElement(ADDR);
    expect([a.street1, a.street2, a.city, a.state, a.zip, a.country]).toEqual([
      "1 Main St",
      "",
      "Springfield",
      "CA",
      "90000",
      "US",
    ]);
  });

  it("[SWHM2-C-0047] an element not named Address is rejected", () => {
    expect(() => addressFromElement("<Place><Street1>1</Street1></Place>")).toThrow();
  });

  it("[SWHM2-C-0048] a credit card is written with its children in order", () => {
    const xml = creditCardToDocument(createCreditCard(CARD));
    expect(childNames(xml)).toEqual(["CardNumber", "CardType", "ExpiryDate"]);
  });

  it("[SWHM2-C-0049] a document whose root is not CreditCard is rejected", () => {
    expect(() => creditCardFromDocument("<Other><CardNumber>1</CardNumber></Other>")).toThrow();
  });

  it("a credit card survives a write and a read, with text escaped", () => {
    const card = { cardNumber: "1&2", cardType: "A<B>", expiryDate: "04/2008" };
    expect(creditCardFromDocument(creditCardToDocument(card))).toEqual(card);
  });

  it("[SWHM2-C-0062] a purchase order document has all parts and a line item", () => {
    const xml = purchaseOrderToDocument({
      orderId: "10011",
      userId: "j2ee",
      emailAddress: "ann@example.com",
      orderDate: Date.UTC(2026, 10, 18),
      locale: "en_US",
      totalPrice: 10,
      contact: contactFromDocument(CONTACT),
      paymentCard: createCreditCard(CARD),
      lineItems: [{ itemId: "EST-1", quantity: 1, unitPrice: 10 }],
    });
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
    expect(xml).toContain("<ItemId>EST-1</ItemId>");
  });
});
