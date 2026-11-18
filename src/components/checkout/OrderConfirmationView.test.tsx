import { render, screen } from "@testing-library/react";

import { createContact } from "@/checkout/contact";
import type { Order } from "@/checkout/store";

import { OrderConfirmationView } from "./OrderConfirmationView";

const order: Order = {
  orderId: "10011",
  userId: "j2ee",
  emailAddress: "ana@example.com",
  orderDate: Date.UTC(2026, 10, 17, 14, 32),
  locale: "en_US",
  totalPrice: 37,
  contact: createContact({
    givenName: "Ana",
    familyName: "Okafor",
    email: "ana@example.com",
    address: {
      street1: "1 Main St",
      street2: "",
      city: "Mountain View",
      state: "CA",
      zip: "94043",
      country: "USA",
    },
  }),
  paymentCard: { cardNumber: "1234-2334", cardType: "Duke Express", expiryDate: "10/2001" },
  lineItems: [{ itemId: "EST-6", quantity: 2, unitPrice: 18.5 }],
};

describe("OrderConfirmationView", () => {
  it("shows the order, its lines, the contact and the placeholder card", () => {
    render(<OrderConfirmationView order={order} names={{ "EST-6": "Male Adult Bulldog" }} />);
    expect(
      screen.getByRole("heading", { name: "Thank you, your order is placed" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/placed 17 Nov 2026, 14:32/)).toBeInTheDocument();
    expect(screen.getByText("Male Adult Bulldog")).toBeInTheDocument();
    expect(screen.getByText("1234-2334")).toBeInTheDocument();
    expect(screen.getByText("Duke Express")).toBeInTheDocument();
    expect(screen.getByText("10/2001")).toBeInTheDocument();
    expect(screen.getByText("Ana Okafor", { selector: "dd" })).toBeInTheDocument();
    expect(screen.getByTestId("order-status")).toHaveTextContent("awaiting approval");
  });
});
