import { ThemeProvider } from "@mui/material/styles";
import { render as rtlRender, screen } from "@testing-library/react";
import { existsSync } from "node:fs";
import path from "node:path";

import { theme } from "@/theme/theme";

import * as breadcrumbs from "./Breadcrumbs";

const { Breadcrumbs } = breadcrumbs;

let mockPath = "/";
jest.mock("next/navigation", () => ({ usePathname: () => mockPath }));

function renderAt(pathname: string) {
  mockPath = pathname;
  return rtlRender(
    <ThemeProvider theme={theme}>
      <Breadcrumbs />
    </ThemeProvider>,
  );
}

describe("Breadcrumbs", () => {
  it.each(["/catalog/items/EST-24", "/catalog/search"])(
    "[SWHM2-C-0249][SWHM2-C-0250] shows no shell trail on %s",
    (pathname) => {
      renderAt(pathname);
      expect(screen.queryByRole("navigation", { name: "Breadcrumb" })).toBeNull();
    },
  );

  it("[SWHM2-C-0251] shows Orders as plain text with no link to a missing page", () => {
    renderAt("/checkout/orders/abc");
    const trail = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(screen.getByText("Orders")).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Orders" })).toBeNull();
    const hrefs = Array.from(trail.querySelectorAll("a")).map((a) => a.getAttribute("href"));
    expect(hrefs).not.toContain("/checkout/orders");
    expect(hrefs).toContain("/checkout");
  });

  it("[SWHM2-C-0252] keeps the admin trail with a link to /admin", () => {
    renderAt("/admin/orders");
    const trail = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(trail.textContent).toContain("Administration of orders");
    expect(
      screen.getByRole("link", { name: "Administration of orders" }).getAttribute("href"),
    ).toBe("/admin");
    expect(screen.getByText("Orders").getAttribute("aria-current")).toBe("page");
  });

  it("[SWHM2-C-0251] lists only paths that have a page on disk", () => {
    const routes = (breadcrumbs as { KNOWN_PAGE_ROUTES?: string[] }).KNOWN_PAGE_ROUTES ?? [];
    expect(routes.length).toBeGreaterThan(0);
    for (const route of routes) {
      const page = path.join(process.cwd(), "src/app/(DashboardLayout)", route, "page.tsx");
      expect(existsSync(page)).toBe(true);
    }
  });
});
