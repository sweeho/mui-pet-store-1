import { render, screen } from "@testing-library/react";

import { SalesChart } from "./SalesChart";

const rows = [
  { name: "DOGS", value: 30 },
  { name: "FISH", value: 10 },
];

test("[SWHM2-C-0243] a bar chart draws one bar per row", () => {
  const { container } = render(<SalesChart rows={rows} kind="bar" />);
  expect(screen.getByRole("img", { name: /bar chart/i })).toBeInTheDocument();
  expect(container.querySelectorAll("rect[data-mark]")).toHaveLength(2);
});

test("[SWHM2-C-0243] a pie chart draws one slice per row", () => {
  const { container } = render(<SalesChart rows={rows} kind="pie" />);
  expect(screen.getByRole("img", { name: /pie chart/i })).toBeInTheDocument();
  expect(container.querySelectorAll("path[data-mark]")).toHaveLength(2);
});
