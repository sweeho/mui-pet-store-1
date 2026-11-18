---
artifact: ticket-summary
spec: 1
status: complete
author_role: implementation
sprint: SWHM2-S-0007
ticket: SWHM2-T-0033
branch: vortex/feat/SWHM2-T-0033-order-fulfilment-and-invoicing-c874e95b
upstream: [artifacts/SWHM2-S-0007/SWHM2-T-0033/PLAN.md]
---

# Summary — SWHM2-T-0033: Order fulfilment and invoicing

## What changed
Approved orders now become supplier orders that ship from stock (whole lines or not at all), one invoice per shipping run, COMPLETED only when every line shipped. The stock clerk updates stock on `/admin/inventory`, which retries every PENDING supplier order.

## Files
- `src/db/schema.ts`, `drizzle/0006_*`, `drizzle/meta/*`: new tables, checks, indexes, `v_order_status` view, `order_line` rebuild keeping rows (the migration's copy was edited to omit the new column).
- `src/db/client.ts`: seeds inventory (10000 per catalog item) when empty.
- `src/fulfilment/*`: `env`, `orders`, `fulfilment`, `inventory`, `documents`, `uidgen`, `dispatch` plus a test beside each.
- `src/approval/dispatch.ts`: hands each supplier purchase order to `dispatchFulfilment`.
- `src/app/api/admin/inventory/route.ts`, `src/app/api/supplier/purchase-orders/**`: the clerk form and the supplier endpoints, with tests.
- `src/components/fulfilment/InventoryView.tsx` and `src/app/(DashboardLayout)/admin/inventory/page.tsx`: the screen (MCK-49/50).
- `e2e/inventory.spec.ts`.

## AC coverage
AC-1 to AC-50 map to cases C-0175 to C-0224; each has a test titled with its key (see `tdd-test-result.md`). Data-model ACs: `schema.test.ts`; orders and statuses: `orders.test.ts`; fulfilment and invoicing: `fulfilment.test.ts`; stock update: `inventory.test.ts`; documents and identifiers: `documents.test.ts`, `uidgen.test.ts`; screen: `InventoryView.test.tsx`, route tests, e2e.

## Verification
- `node .vortex/check-versions.mjs && npm run verify`: pass (eslint --max-warnings 0, prettier, typecheck, jest 57 suites / 291 tests).
- `npm run test:e2e`: 21 passed.
- `npm run test:acceptance`: order-fulfilment passes; four suites fail to load for modules of later capabilities (`admin/launch`, `batch/jobs`, `i18n/format`, `notifications/sender`), as before this ticket.
- `npx playwright test --config playwright.acceptance.config.ts tests/acceptance/order-fulfilment`: C-0195 and C-0211 pass; C-0179 fails in the locked spec (strict-mode: `has: quantities.nth(i)` matches every row); disputed, finding 20b504f5.

CODE-REVIEW: sub-agent — fixed: stock taken only for the unshipped remainder after a partial invoice, no processing of non-waiting orders, status re-read inside the run's transaction, double XML decode, outbox dispatch in a `finally`; rejected: invoice input validation (the CHECK constraints reject over-shipping) and an atomic duplicate-POST check (rare race; a duplicate is dropped, not stored twice).

- Design check: `design-check.md` (both mockups measured).

## Notes
- Files outside the ownership list edited because the seeded stock now ships approved orders: `src/app/api/admin/routes.test.ts` and `e2e/approval.spec.ts` (an approved order may already be COMPLETED); `src/approval/dispatch.test.ts` clears inventory to stay about approval.
- Fulfilment unit tests use `useIsolatedDatabase` so `resetData` never wipes the shared test database.
- The supplier routes need no sign-in (R-0187, SD3): anyone who can reach the app can post a supplier order. Security point for the Business Owner.
