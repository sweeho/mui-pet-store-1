import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

import { OrderApprovalView, type ApprovalOrder } from "./OrderApprovalView";

const refresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh, push: jest.fn() }),
  usePathname: () => "/admin/orders",
}));

const orders: ApprovalOrder[] = [
  {
    orderId: "1001",
    userName: "j2ee",
    orderTime: Date.UTC(2026, 10, 12),
    total: 612.5,
    status: "PENDING",
  },
  {
    orderId: "1002",
    userName: "acid",
    orderTime: Date.UTC(2026, 10, 13),
    total: 1240,
    status: "PENDING",
  },
  {
    orderId: "1003",
    userName: "kmlee",
    orderTime: Date.UTC(2026, 10, 14),
    total: 508,
    status: "PENDING",
  },
  {
    orderId: "1004",
    userName: "j2ee",
    orderTime: Date.UTC(2026, 10, 14),
    total: 99,
    status: "APPROVED",
  },
];

const row = (id: string) => document.querySelector(`tr[data-order-id="${id}"]`) as HTMLElement;
let fetchMock: jest.Mock;
beforeEach(() => {
  refresh.mockReset();
  fetchMock = jest.fn(async () => ({
    ok: true,
    json: async () => ({ sent: 2, approved: ["1001", "1002"], denied: [] }),
  }));
  global.fetch = fetchMock as unknown as typeof fetch;
});

test("[SWHM2-C-0027] Commit sends only the changed orders", async () => {
  render(<OrderApprovalView orders={orders} />);
  fireEvent.click(within(row("1001")).getByRole("button", { name: /^approved$/i }));
  fireEvent.click(within(row("1002")).getByRole("button", { name: /^approved$/i }));
  fireEvent.click(screen.getByRole("button", { name: /^commit$/i }));
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
  expect(body.decisions).toEqual([
    { orderId: "1001", status: "APPROVED" },
    { orderId: "1002", status: "APPROVED" },
  ]);
  await waitFor(() => expect(refresh).toHaveBeenCalled());
  expect(await screen.findByText(/changes sent/i)).toBeInTheDocument();
});

test("[SWHM2-C-0028] a non-PENDING order has no controls", () => {
  render(<OrderApprovalView orders={orders} />);
  const r = row("1004");
  expect(r).toHaveAttribute("data-status", "APPROVED");
  expect(within(r).queryByRole("button")).toBeNull();
  expect(within(r).queryByRole("combobox")).toBeNull();
});

test("[SWHM2-C-0029] choosing Denied sends nothing before Commit", () => {
  render(<OrderApprovalView orders={orders} />);
  fireEvent.click(within(row("1003")).getByRole("button", { name: /^denied$/i }));
  expect(fetchMock).not.toHaveBeenCalled();
  expect(row("1003")).toHaveAttribute("data-status", "PENDING");
  expect(screen.getByRole("button", { name: /^commit$/i })).toBeEnabled();
  fireEvent.click(screen.getByRole("button", { name: /discard changes/i }));
  expect(screen.getByRole("button", { name: /^commit$/i })).toBeDisabled();
});
