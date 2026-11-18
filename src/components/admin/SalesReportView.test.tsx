import { fireEvent, render, screen } from "@testing-library/react";

import { SalesReportView } from "./SalesReportView";

const query = { start: "10/01/2026", end: "10/31/2026", type: "REVENUE", category: "" };
const categories = ["BIRDS", "DOGS"];

test("[SWHM2-C-0243] the report lists rows with shares and a grand total, and toggles bar and pie", () => {
  render(
    <SalesReportView
      query={query}
      categories={categories}
      result={{
        rows: [
          { name: "DOGS", value: 75 },
          { name: "BIRDS", value: 25 },
        ],
        total: 100,
      }}
    />,
  );
  expect(screen.getByLabelText(/start date/i)).toHaveValue("10/01/2026");
  expect(screen.getByText("75.0%")).toBeInTheDocument();
  expect(screen.getByText(/grand total/i)).toBeInTheDocument();
  expect(screen.getByRole("img", { name: /bar chart/i })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /^pie$/i }));
  expect(screen.getByRole("img", { name: /pie chart/i })).toBeInTheDocument();
});

test("[SWHM2-C-0233] a date error is shown with the MM/dd/yyyy hint and no table", () => {
  render(
    <SalesReportView
      query={{ ...query, end: "2026-10-31" }}
      categories={categories}
      result={{ error: "Enter the date as MM/dd/yyyy" }}
    />,
  );
  expect(screen.getAllByText(/MM\/dd\/yyyy/).length).toBeGreaterThan(0);
  expect(screen.queryByText(/grand total/i)).toBeNull();
  expect(screen.getByLabelText(/end date/i)).toHaveAttribute("aria-invalid", "true");
});

test("[SWHM2-C-0240] the quantity type labels the report as quantity", () => {
  render(
    <SalesReportView
      query={{ ...query, type: "QUANTITY" }}
      categories={categories}
      result={{ rows: [{ name: "DOGS", value: 3 }], total: 3 }}
    />,
  );
  expect(screen.getByRole("heading", { name: /quantity by category/i })).toBeInTheDocument();
});
