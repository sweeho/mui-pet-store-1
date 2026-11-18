import { render, screen } from "@testing-library/react";

import type { CartLine } from "@/cart/listing";

import { CartView } from "./CartView";

const lines: CartLine[] = [
  {
    itemId: "EST-1",
    productId: "FI-SW-01",
    categoryId: "FISH",
    name: "Angelfish",
    attribute: "Large",
    quantity: 2,
    unitCost: 16.5,
    total: 33,
  },
  {
    itemId: "EST-6",
    productId: "K9-BD-01",
    categoryId: "DOGS",
    name: "Bulldog",
    attribute: "Male Adult",
    quantity: 1,
    unitCost: 18.5,
    total: 18.5,
  },
];

describe("CartView", () => {
  it("[SWHM2-C-0075] shows each line with its catalog data and totals", () => {
    render(<CartView lines={lines} subtotal={51.5} itemCount={2} signedOn={false} />);
    expect(screen.getByText("EST-1")).toBeInTheDocument();
    expect(screen.getByText("FI-SW-01")).toBeInTheDocument();
    expect(screen.getByText("Angelfish")).toBeInTheDocument();
    expect(screen.getByText("$16.50")).toBeInTheDocument();
    expect(screen.getByText("$33.00")).toBeInTheDocument();
    expect(screen.getByLabelText("Quantity of Angelfish, Large")).toHaveValue("2");
    expect(screen.getByText("$51.50")).toBeInTheDocument();
  });

  it("[SWHM2-C-0067] the summary counts distinct lines", () => {
    render(<CartView lines={lines} subtotal={51.5} itemCount={2} signedOn={false} />);
    expect(screen.getByText("2 items in your cart", { exact: false })).toBeInTheDocument();
  });

  it("[SWHM2-C-0072] each line has a remove button and the cart can be emptied", () => {
    render(<CartView lines={lines} subtotal={51.5} itemCount={2} signedOn={false} />);
    expect(
      screen.getByRole("button", { name: "Remove Angelfish, Large from cart" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /empty cart/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /update cart/i })).toBeInTheDocument();
  });

  it("[SWHM2-C-0077] a signed-out shopper proceeds to checkout through sign-on", () => {
    render(<CartView lines={lines} subtotal={51.5} itemCount={2} signedOn={false} />);
    const links = screen.getAllByRole("link", { name: /proceed to checkout/i });
    for (const l of links) expect(l).toHaveAttribute("href", "/signon?returnTo=/checkout");
  });

  it("[SWHM2-C-0077] a signed-on shopper proceeds straight to checkout", () => {
    render(<CartView lines={lines} subtotal={51.5} itemCount={2} signedOn />);
    const links = screen.getAllByRole("link", { name: /proceed to checkout/i });
    for (const l of links) expect(l).toHaveAttribute("href", "/checkout");
  });

  it("[SWHM2-C-0073] an empty cart shows the empty frame with a way to the catalog", () => {
    render(<CartView lines={[]} subtotal={0} itemCount={0} signedOn={false} />);
    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /catalog & search/i })).toHaveAttribute(
      "href",
      "/catalog",
    );
  });
});
