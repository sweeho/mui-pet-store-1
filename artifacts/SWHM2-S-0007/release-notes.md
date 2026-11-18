---
artifact: release-notes
spec: 1
status: complete
author_role: planning
sprint: SWHM2-S-0007
capability brief: SWHM2-I-0007
branch: vortex/sprint/swhm2-s-0007-271cdb8d
upstream: [artifacts/SWHM2-S-0007/qa-test-report.md]
---

# Release notes — SWHM2-S-0007

## Added

- **Approved orders are fulfilled.** Each approved order goes to the supplier with its shipping
  details and every line. Denied orders never do. (SWHM2-T-0033)
- **Lines ship from stock.** A line ships only when there is enough stock for all of it, and stock
  goes down by that amount. A line short of stock waits, and stock is left alone. A line is never
  shipped twice. (SWHM2-T-0033)
- **Invoices.** Each shipping run produces one invoice listing only the lines shipped in it. If the
  invoice cannot be produced, nothing is marked shipped. (SWHM2-T-0033)
- **Orders complete.** An order becomes Completed when every line has shipped, and is queued for
  the completion notice. A partly shipped order stays waiting. (SWHM2-T-0033)
- **Inventory screen for stock clerks** (`/admin/inventory`, signed in as an administrator).
  - It lists every item with its current quantity.
  - Type a new quantity, tick the items to change and press **Update inventory**. Only ticked rows
    with a quantity of zero or more change; blank or negative entries are ignored.
  - Every waiting order is retried straight away, and "Stock updated" confirms it. (SWHM2-T-0033)
- **Supplier endpoints.** `POST /api/supplier/purchase-orders` accepts a supplier order as XML;
  `GET /api/supplier/purchase-orders/<id>` returns its status. (SWHM2-T-0033)

## Changed

- An approved order with stock for every line now ships and completes as soon as it is approved,
  instead of staying Approved. (SWHM2-T-0033)

## Fixed

- The order approval browser test no longer fails intermittently when it clicks before the page is
  ready. (QA, SWHM2-T-0034)

## Upgrade notes

- **Migration** `drizzle/0006_*` adds the fulfilment tables, indexes and the order-status view,
  and rebuilds `order_line` keeping its rows. It runs on first use, like the earlier ones.
- **Starting stock:** when the inventory table is empty, every catalog item is stocked at 10000.
  Replace it with real figures through the Inventory screen; the bulk inventory load comes with
  batch operations.
- No new dependency and no new environment variable.

## Not included

- The completion and shipment e-mails themselves come with order notifications. Completed orders
  wait in the outbox for them.
- The bulk inventory load and the purge schedule belong to batch operations.
- **The supplier endpoints need no sign-in**, as the specification requires. Anyone who can reach
  the app can post a supplier order. Restrict access at the network edge until the Business Owner
  decides.
- The screen differs from the mockups: it uses the site shell, prints quantities without thousands
  separators, and keeps **Update inventory** enabled with nothing ticked. See `qa-test-report.md`
  § Design fidelity.

## Verification

Verified at integration QA: PASS, one flaky test fixed in place. One locked browser case (C-0179)
is disputed and judged at UAT. See `artifacts/SWHM2-S-0007/qa-test-report.md`.

## Compliance / Control Evidence

| Control | Evidence | Location | Status | Exception |
| --- | --- | --- | --- | --- |
| Release contents recorded | this file | `artifacts/SWHM2-S-0007/release-notes.md` | Satisfied | — |
| Release verified before land | QA PASS verdict | `artifacts/SWHM2-S-0007/qa-test-report.md` | Satisfied | C-0179 disputed |
| Known limitations disclosed | Not included, Upgrade notes | this file | Satisfied | Open supplier endpoints (SD3) |
