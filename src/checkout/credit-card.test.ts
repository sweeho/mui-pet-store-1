import { createCreditCard, getExpiryMonth, getExpiryYear } from "./credit-card";

const CARD = { cardNumber: "4111111111111111", cardType: "Visa", expiryDate: "04/2008" };

describe("credit card", () => {
  it("[SWHM2-C-0039] holds number, type and expiry as text", () => {
    const c = createCreditCard(CARD);
    expect([typeof c.cardNumber, typeof c.cardType, typeof c.expiryDate]).toEqual([
      "string",
      "string",
      "string",
    ]);
  });

  it("[SWHM2-C-0058] is created from number, type and expiry", () => {
    expect(
      createCreditCard({ cardNumber: "123", cardType: "Amex", expiryDate: "01/2030" }),
    ).toEqual({ cardNumber: "123", cardType: "Amex", expiryDate: "01/2030" });
  });

  it("[SWHM2-C-0059] is created from an existing data object, as a copy", () => {
    const source = { ...CARD };
    const c = createCreditCard(source);
    expect(c).toEqual(CARD);
    expect(c).not.toBe(source);
  });

  it("[SWHM2-C-0057] expiry 04/2008 splits into month 04 and year 2008", () => {
    const c = createCreditCard(CARD);
    expect(getExpiryMonth(c)).toBe("04");
    expect(getExpiryYear(c)).toBe("2008");
  });

  it("[SWHM2-C-0052] a missing or slashless expiry gives 01 and 2010", () => {
    for (const c of [
      createCreditCard({ cardNumber: "1", cardType: "Visa" }),
      createCreditCard({ ...CARD, expiryDate: "0408" }),
    ]) {
      expect(getExpiryMonth(c)).toBe("01");
      expect(getExpiryYear(c)).toBe("2010");
    }
  });

  it("splits on the first slash only", () => {
    const c = createCreditCard({ ...CARD, expiryDate: "04/20/08" });
    expect(getExpiryMonth(c)).toBe("04");
    expect(getExpiryYear(c)).toBe("20/08");
  });
});
