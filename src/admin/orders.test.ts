/** @jest-environment node */
import { useIsolatedDatabase } from "@/db/isolated";

import { addOrder, clearOrders } from "./fixtures";
import { listOrderOperations, listOrdersByStatus } from "./orders";

let db: Awaited<ReturnType<typeof useIsolatedDatabase>>;
beforeAll(async () => {
  db = await useIsolatedDatabase();
});
beforeEach(() => clearOrders(db));

test("[SWHM2-C-0230] the operations view lists only orders with a status row", async () => {
  await addOrder(db, { id: 1, user: "alice", total: 42.5, statuses: ["PENDING"] });
  await addOrder(db, { id: 2, user: "bob", statuses: [] });
  const rows = await listOrderOperations(db);
  expect(rows).toHaveLength(1);
  expect(rows[0]).toMatchObject({ orderId: 1, userId: "alice", value: 42.5, status: "PENDING" });
  expect(rows[0].date).toBeTruthy();
});

test("[SWHM2-C-0237] a PENDING listing returns id, user, M/D/YYYY date, value and status", async () => {
  await addOrder(db, {
    id: 7,
    user: "carol",
    time: new Date(2020, 0, 5, 12),
    total: 99.5,
    statuses: ["PENDING"],
  });
  await addOrder(db, { id: 8, statuses: ["APPROVED"] });
  expect(await listOrdersByStatus(db, "PENDING")).toEqual([
    { orderId: 7, userId: "carol", date: "1/5/2020", value: 99.5, status: "PENDING" },
  ]);
});

test("[SWHM2-C-0239] an order with several matching rows is listed once, by its latest status", async () => {
  await addOrder(db, { id: 9, statuses: ["PENDING", "PENDING"] });
  await addOrder(db, { id: 10, statuses: ["PENDING", "APPROVED"] });
  const rows = await listOrdersByStatus(db, "PENDING");
  expect(rows.map((r) => r.orderId)).toEqual([9]);
});
