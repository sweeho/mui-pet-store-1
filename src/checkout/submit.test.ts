import { createContact } from "./contact";
import { buildOrder } from "./submit";

describe("buildOrder", () => {
  it("[SWHM2-C-0054] carries the placeholder card, not the customer's", () => {
    const order = buildOrder({
      orderId: "10011",
      userId: "j2ee",
      locale: "en_US",
      contact: createContact({ email: "a@b.c" }),
      lines: [
        { itemId: "EST-1", quantity: 2, unitPrice: 10 },
        { itemId: "EST-2", quantity: 1, unitPrice: 5.5 },
      ],
      now: 1000,
    });
    expect(order.paymentCard).toEqual({
      cardNumber: "1234-2334",
      cardType: "Duke Express",
      expiryDate: "10/2001",
    });
    expect(order.totalPrice).toBe(25.5);
    expect(order.emailAddress).toBe("a@b.c");
    expect(order.orderDate).toBe(1000);
    expect(order.lineItems).toHaveLength(2);
  });
});
