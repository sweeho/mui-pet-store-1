import { fireEvent, render, screen, within } from "@testing-library/react";

import { InventoryView } from "./InventoryView";

const items = [
  { itemId: "EST-1", quantity: 10 },
  { itemId: "EST-2", quantity: 0 },
];

const rowOf = (itemId: string) =>
  screen.getByDisplayValue("", { selector: `[name="qty_${itemId}"]` }).closest("tr")!;

describe("InventoryView", () => {
  it("[SWHM2-C-0179] each row shows item id, existing quantity, a new-quantity input and a checkbox, with a submit control", () => {
    const { container } = render(<InventoryView items={items} />);
    for (const { itemId, quantity } of items) {
      const row = rowOf(itemId);
      const cells = within(row).getAllByRole("cell");
      expect(cells[0]).toHaveTextContent(itemId);
      expect(Number.parseInt(cells[1].textContent ?? "", 10)).toBe(quantity);
      expect(row.querySelector(`input[name="qty_${itemId}"]`)).not.toBeNull();
      expect(row.querySelector(`input[type="checkbox"][name="item_${itemId}"]`)).not.toBeNull();
    }
    expect(container.querySelector('form button[type="submit"]')).not.toBeNull();
    expect(screen.getByText("Out of stock")).toBeInTheDocument();
  });

  it("[SWHM2-C-0195] a typed quantity on an unticked row is flagged as not changing, and the count follows the ticks", () => {
    render(<InventoryView items={items} />);
    expect(screen.getByText("0 items will change")).toBeInTheDocument();
    const qty = rowOf("EST-1").querySelector<HTMLInputElement>('input[name="qty_EST-1"]')!;
    fireEvent.change(qty, { target: { value: "25" } });
    expect(screen.getByText(/Not ticked/)).toBeInTheDocument();
    const box = rowOf("EST-1").querySelector<HTMLInputElement>('input[name="item_EST-1"]')!;
    expect(box.checked).toBe(false);
    fireEvent.click(box);
    expect(screen.getByText("1 item will change")).toBeInTheDocument();
    fireEvent.change(qty, { target: { value: "-3" } });
    expect(screen.getByText(/Must be a whole number, 0 or more/)).toBeInTheDocument();
    expect(screen.getByText("0 items will change")).toBeInTheDocument();
    fireEvent.change(qty, { target: { value: "" } });
    expect(screen.getByText(/No new quantity/)).toBeInTheDocument();
  });

  it("shows the Stock updated alert and dismisses it", () => {
    render(<InventoryView items={items} updated={2} />);
    expect(screen.getByText("Stock updated for 2 items")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /dismiss/i }));
    expect(screen.queryByText("Stock updated for 2 items")).toBeNull();
  });
});
