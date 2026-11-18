import { fireEvent, render, screen } from "@testing-library/react";

import type { CartLine } from "@/cart/listing";

import { CheckoutView } from "./CheckoutView";

const lines: CartLine[] = [
  {
    itemId: "EST-6",
    productId: "K9-BD-01",
    categoryId: "DOGS",
    name: "Male Adult Bulldog",
    attribute: "Bulldog",
    quantity: 2,
    unitCost: 18.5,
    total: 37,
  },
];

const fill = (label: string, value: string) =>
  fireEvent.change(screen.getAllByLabelText(label)[0], { target: { value } });

describe("CheckoutView", () => {
  it("shows the empty frame with a way back to the cart when the cart is empty", () => {
    render(<CheckoutView lines={[]} subtotal={0} />);
    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to cart" })).toHaveAttribute("href", "/cart");
  });

  it("starts on shipping and contact with the order summary", () => {
    render(<CheckoutView lines={lines} subtotal={37} />);
    expect(screen.getByRole("heading", { name: "Checkout" })).toBeInTheDocument();
    expect(screen.getByText("Male Adult Bulldog")).toBeInTheDocument();
    expect(screen.getAllByText("$37.00").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /continue to billing and payment/i })).toBeVisible();
  });

  it("names a missing required shipping field and stays on step 1", () => {
    render(<CheckoutView lines={lines} subtotal={37} />);
    fireEvent.click(screen.getByRole("button", { name: /continue to billing and payment/i }));
    expect(screen.getByText("Street line 1 is required")).toBeInTheDocument();
    expect(screen.getByText("City is required")).toBeInTheDocument();
    expect(screen.queryByText(/placeholder card/)).not.toBeVisible();
  });

  it("moves to billing and payment once shipping is complete, and blocks a missing card", () => {
    render(<CheckoutView lines={lines} subtotal={37} />);
    fill("Street line 1", "1 Main St");
    fill("City", "Mountain View");
    fill("State", "CA");
    fill("Zip code", "94043");
    fill("Country", "USA");
    fireEvent.click(screen.getByRole("button", { name: /continue to billing and payment/i }));
    expect(screen.getByText(/Your card is not charged yet/)).toBeVisible();
    expect(screen.getByText(/Shipping to 1 Main St/)).toBeInTheDocument();
    const place = screen.getByRole("button", { name: /place order/i });
    expect(place).toHaveTextContent("$37.00");
    fireEvent.click(screen.getByLabelText("Same as shipping address"));
    expect(fireEvent.submit(place.closest("form") as HTMLFormElement)).toBe(false);
    expect(screen.getByText("Card number is required")).toBeInTheDocument();
  });
});
