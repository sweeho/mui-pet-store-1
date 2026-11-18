import { ThemeProvider } from "@mui/material/styles";
import { render as rtlRender, screen } from "@testing-library/react";
import type { ReactElement } from "react";

import { theme } from "@/theme/theme";

import { DashboardShell } from "./DashboardShell";

function render(ui: ReactElement) {
  return rtlRender(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

jest.mock("next/navigation", () => ({ usePathname: () => "/catalog" }));

beforeEach(() => {
  // A large screen: the permanent sidebar is in the DOM.
  window.matchMedia = ((query: string) => ({
    matches: true,
    media: query,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    onchange: null,
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
});

describe("DashboardShell", () => {
  it("[SWHM2-C-0227] puts the page between the header and the footer, beside the navigation", () => {
    render(
      <DashboardShell>
        <p>page body</p>
      </DashboardShell>,
    );

    const header = screen.queryByRole("banner");
    const main = screen.queryByRole("main");
    const footer = screen.queryByRole("contentinfo");
    expect(header).toBeInTheDocument();
    expect(footer).toBeInTheDocument();
    expect(main).toHaveTextContent("page body");
    expect(header!.compareDocumentPosition(main!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(main!.compareDocumentPosition(footer!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getAllByRole("navigation").length).toBeGreaterThan(0);
  });

  it("[SWHM2-C-0226] the first navigation links every area and back to the landing page", () => {
    render(<DashboardShell>x</DashboardShell>);

    const nav = screen.getAllByRole("navigation")[0];
    const hrefs = Array.from(nav.querySelectorAll("a")).map((a) => a.getAttribute("href"));
    for (const h of ["/", "/catalog", "/cart", "/signon", "/admin/inventory", "/admin"]) {
      expect(hrefs).toContain(h);
    }
  });
});

describe("DashboardShell session state", () => {
  it("offers Sign on and Create account when signed out", () => {
    render(<DashboardShell>x</DashboardShell>);
    expect(screen.getAllByRole("link", { name: "Sign on" })[1]).toHaveAttribute("href", "/signon");
    expect(screen.getByRole("link", { name: "Create account" })).toHaveAttribute(
      "href",
      "/accounts/create",
    );
    expect(screen.getByRole("contentinfo")).toHaveTextContent("15 minutes of inactivity");
  });

  it("shows the user name and Sign off when signed on", () => {
    render(<DashboardShell username="jsmith">x</DashboardShell>);
    expect(screen.getByRole("link", { name: "jsmith" })).toHaveAttribute("href", "/account");
    expect(screen.getByRole("button", { name: "Sign off" })).toBeInTheDocument();
    expect(screen.getByRole("banner")).not.toHaveTextContent("Create account");
  });
});
