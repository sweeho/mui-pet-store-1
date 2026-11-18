import { render, screen } from "@testing-library/react";

import { AdminHomeView } from "./AdminHomeView";

test("[SWHM2-C-0234] the home offers Launch Rich Client, two cards and a Log out form button", () => {
  render(<AdminHomeView />);
  expect(screen.getByRole("link", { name: /launch rich client/i })).toHaveAttribute(
    "href",
    "/admin/orders",
  );
  expect(screen.getByRole("link", { name: /orders by status/i })).toHaveAttribute(
    "href",
    "/admin/orders",
  );
  expect(screen.getByRole("link", { name: /sales reports/i })).toHaveAttribute(
    "href",
    "/admin/reports",
  );
  const logout = screen.getByRole("button", { name: /log ?out/i });
  expect(logout.closest("form")).toHaveAttribute("action", "/api/admin/logout");
  expect(logout.closest("form")).toHaveAttribute("method", "post");
});
