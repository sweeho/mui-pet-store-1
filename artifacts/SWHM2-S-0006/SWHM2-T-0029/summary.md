---
artifact: summary
ticket: SWHM2-T-0029
---
# Summary — SWHM2-T-0029 Order approval

CODE-REVIEW: sub-agent — fixed: conditional claim of a PENDING order in the handler (two racing messages cannot both change it), Commit summary lists only orders that were PENDING, once each; rejected: non-atomic receive/dispatch (the in-process queue is the legacy equivalent; a failure returns 500 and a retry is a follow-up with I-0010/I-0011), admin session expiry and `Secure` cookie (I-0009 extends the session contract; SD1).

## What changed

- **Tables** (`drizzle/0005_*`): `purchase_order`, `order_manager`, `order_line`, `message_outbox`, `admin_session`. The order id columns have NUMERIC affinity: the locked harnesses insert integer ids, which the driver binds as REAL, so `304.0` and `"304"` must compare equal. Text ids (`10011`, `DEMO-0001`) are kept as text.
- **`src/approval/`**: `orders` (status values, checked in code), `policy` (US < 500, Japan < 50000, strict), `receive`, `decision`, `handler` (only PENDING changes; APPROVED adds a supplier order; every change is listed for notification), `supplier`, `documents` (OrderApproval XML), `dispatch` (in-process consumer that writes the outbox), `demo` (4 PENDING and 1 APPROVED demo order, shortfall only).
- **Checkout** hands each placed order to `receivePurchaseOrder` then `dispatchApprovals`.
- **Admin**: `/admin/login`, `/admin/orders` (`OrderApprovalView`), `POST /api/admin/login`, `POST /api/admin/approvals`, `GET /api/admin/approvals/sent`, `GET /api/admin/orders/[id]`; all admin routes answer 401 without the `admin_session` cookie. Credentials: `ADMIN_USER` / `ADMIN_PASSWORD`, default `j2ee` / `j2ee`.
- **Design**: tokens `success` and `warning` set to the mockups' colours; `@fontsource-variable/jetbrains-mono` added and loaded in `layout.tsx`. See `design-check.md`.

## Deviations from PLAN.md

- NUMERIC order-id columns instead of text (P1), for the reason above.
- `src/app/layout.tsx` and `package.json` touched for the mono font; `design/tokens.mui.json` for the status colours.
- No navigation entry; `/admin` is unchanged (P6).

## AC coverage

AC-1 to AC-16 map to cases C-0033, C-0034, C-0035, C-0030, C-0023, C-0024, C-0022, C-0025, C-0026, C-0032, C-0031, C-0036, C-0021, C-0028, C-0027, C-0029; each has a passing test with its key (`tdd-test-result.md`). Cases that already passed at red: none.

## Verification

- `node .vortex/check-versions.mjs && npm run verify:full`: exit 0 (lint, format, typecheck, Jest, Playwright 20+ specs including `e2e/approval.spec.ts`).
- `npx jest -c jest.acceptance.config.mjs tests/acceptance/order-approval`: 13 passed.
- `npm run test:acceptance` and `:e2e`: the order-approval suites pass; the remaining failures belong to later capabilities (admin-order-management, order-fulfilment, batch-operations, order-notifications, internationalisation) whose screens do not exist yet.
