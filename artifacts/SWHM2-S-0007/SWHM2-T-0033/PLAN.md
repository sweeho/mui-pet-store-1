---
artifact: plan
sprint: SWHM2-S-0007
ticket: SWHM2-T-0033
author: planning
change: swhm2-i-0007-order-fulfilment-and-invoic
---

# PLAN — SWHM2-T-0033 Order fulfilment and invoicing

## Objective

Build the whole change `swhm2-i-0007-order-fulfilment-and-invoic`:
- Approved orders become supplier orders.
- A line ships from stock in full or not at all.
- Each run that ships produces one invoice of those lines.
- An order is COMPLETED only when every line has shipped.
- A stock clerk updates stock on `/admin/inventory`, which retries every PENDING supplier order.

Read the change's `design.md` § Sprint planning first: Codebase findings, Decisions P1–P10 and
Spec discrepancies SD1–SD11. The locked `tests/acceptance/order-fulfilment/harness.ts` is the
interface contract: module names, function signatures, table and column names, routes.

## Steps (in `tasks.md` order)

1. **Data model (1.1–1.5):** the tables, columns, checks, indexes and the view `v_order_status`
   in `src/db/schema.ts`. Generate `drizzle/0006_*` and commit it (P1). `order_line`'s rebuild
   keeps its rows.
2. **Order intake and status (2.1–2.5):**
   - `src/fulfilment/env.ts` (P2).
   - `src/fulfilment/orders.ts` (P3, SD1, SD8, SD9, SD11): the five statuses, create and get
     supplier orders, create and get purchase orders, find by status, `listOrderStatus` over the
     view, `approveOrder`, `purgeSupplierOrders` and `parseSupplierOrderMessage` (SD10).
3. **Fulfilment (3.1–3.5):**
   - `src/fulfilment/fulfilment.ts`: `fulfilLine`, `processOrder`, `receiveSupplierOrder` (P4),
     `processInvoice` (P5, SD2) and `processApproval` (P7).
   - `src/fulfilment/inventory.ts`: `updateInventory` (P9).
4. **Documents and identifiers (4.1–4.4):**
   - `src/fulfilment/documents.ts` (P7, SD4) and `src/fulfilment/uidgen.ts` (P8, SD7).
   - Wiring: `src/fulfilment/dispatch.ts`, called from `src/approval/dispatch.ts` (P6).
5. **Inventory screen (5.1, 5.2)** (P9, P10, SD3, SD5):
   - the `/admin/inventory` page and `src/components/fulfilment/InventoryView.tsx`
   - `POST /api/admin/inventory`
   - `POST /api/supplier/purchase-orders` and `GET /api/supplier/purchase-orders/[id]`
   - the starting-inventory seed in `src/db/client.ts`.
6. **Test harness:**
   - A unit test beside every new module.
   - A route test beside every new route.
   - A component test for `InventoryView`: unticked rows and blank or negative values are
     flagged, and the count follows the ticks.
   - `e2e/inventory.spec.ts`: sign in, set one ticked row, see its new quantity.
   - Extend `src/app/api/checkout/orders/route.test.ts`: a small approved order with stock ends
     COMPLETED, and a supplier order and an invoice are in `message_outbox`.
7. **CI:** no workflow change is expected (design.md § Phases 7). Check that the new migration
   and the e2e spec run in the existing jobs.

## Design reference

Approved mockups, exported to `artifacts/SWHM2-S-0007/design/` (see `MANIFEST.md`):

| File | Route and state | Viewport |
|---|---|---|
| `mockup-inventory.html` (SWHM2-MCK-49) | `/admin/inventory`, signed in at `/admin/login`: two rows ticked with new quantities, one unticked row and one negative value flagged; after submit, the "Stock updated" alert (`?updated=<n>`) | 1440×900 |
| `mockup-inventory-mobile.html` (SWHM2-MCK-50) | `/admin/inventory`, same states | 390×844 |

Build the page inside the app's shell, with no header or sidebar of its own (SD6). It has:
- the page title and its one-line description
- a table with columns Item id, Existing quantity, New quantity and Update
- an "Out of stock" badge at 0
- a row hint for "Not ticked", "No new quantity" and "Must be a whole number, 0 or more"
- the "N items will change" line and the "Blank or negative quantities are ignored." note
- the Update inventory button
- the dismissable "Stock updated for N items" alert.

On mobile, the same controls are stacked per item.

Two deliberate differences (SD5):
- The button is never disabled.
- Existing quantities are plain integers, with no thousands separator.

Each row's inputs are named `qty_<itemId>` and `item_<itemId>`. The existing quantity is the
row's second cell.

## File/module ownership

- `src/fulfilment/**` (new)
- `src/components/fulfilment/**` (new)
- `src/db/schema.ts`, `src/db/client.ts`, `drizzle/0006_*` and `drizzle/meta/*`
- `src/approval/dispatch.ts` and `dispatch.test.ts` (the hand-off only)
- `src/app/(DashboardLayout)/admin/inventory/page.tsx`
- `src/app/api/admin/inventory/route.ts` and its test (new)
- `src/app/api/supplier/purchase-orders/route.ts`, `.../[id]/route.ts` and their tests (new)
- `src/app/api/checkout/orders/route.test.ts`
- `e2e/inventory.spec.ts` (new)
- `artifacts/SWHM2-S-0007/SWHM2-T-0033/**`

Not owned:
- `tests/acceptance/**` (locked)
- `openspec/**`
- `src/shell/**` (the navigation entry already exists)
- `src/approval/*` other than `dispatch.ts`
- `src/checkout/**` other than the route test named above

## Definition of Done

- AC-1 to AC-50 on the ticket hold. Each is one scenario of the delta spec, and each case
  SWHM2-C-0175 to C-0224 has a passing test whose title carries its key.
- A small order placed through checkout reaches the supplier. With stock it ends COMPLETED, and
  its stock is reduced.
- The order-approval, checkout, site-shell and other suites that passed before this change still
  pass.
