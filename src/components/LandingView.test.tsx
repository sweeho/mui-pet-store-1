import { render, screen } from "@testing-library/react";

import { LandingView } from "./LandingView";

const AREAS = ["/catalog", "/cart", "/signon", "/admin/inventory", "/admin"];

describe("LandingView", () => {
  it("[SWHM2-C-0225] shows the welcome title and links every primary area", () => {
    render(<LandingView firstUser={{ id: 1, name: "John Doe", email: "john@example.com" }} />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Welcome to Pet Store");
    const hrefs = screen.getAllByRole("link").map((a) => a.getAttribute("href"));
    for (const area of AREAS) expect(hrefs).toContain(area);
  });
});
