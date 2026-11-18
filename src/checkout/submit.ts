import type { Contact } from "./contact";
import type { Order } from "./store";

/** The user an order is recorded under without a session (SD2). */
export const ANONYMOUS = "anonymous";
/** The identifier sequence of orders: the first order id is 10011. */
export const ORDER_SEQUENCE = "1001";

export type SubmitLine = { itemId: string; quantity: number; unitPrice: number };

/** The placeholder card every order carries while the store moves to a new payment provider (R-0152). */
export const PLACEHOLDER_CARD = {
  cardNumber: "1234-2334",
  cardType: "Duke Express",
  expiryDate: "10/2001",
} as const;

/** The order for these cart lines: placeholder card, the user, locale and total. */
export function buildOrder(input: {
  orderId: string;
  userId: string;
  locale: string;
  contact: Contact;
  billTo?: Contact["address"];
  lines: SubmitLine[];
  now: number;
  enteredCardId?: number | null;
}): Order {
  return {
    orderId: input.orderId,
    userId: input.userId,
    emailAddress: input.contact.email,
    orderDate: input.now,
    locale: input.locale,
    totalPrice: input.lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0),
    contact: input.contact,
    billTo: input.billTo,
    paymentCard: { ...PLACEHOLDER_CARD },
    enteredCardId: input.enteredCardId ?? null,
    lineItems: input.lines,
  };
}
