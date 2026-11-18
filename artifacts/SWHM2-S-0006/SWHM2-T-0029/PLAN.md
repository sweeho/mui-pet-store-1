---
artifact: plan
sprint: SWHM2-S-0006
ticket: SWHM2-T-0029
author: planning
change: swhm2-i-0006-order-approval
---

# PLAN — SWHM2-T-0029 Order approval

## Objective

Build the whole change `swhm2-i-0006-order-approval`:
- Small US and Japan orders are approved automatically.
- Every other order waits PENDING for an administrator.
- Approval messages update only PENDING orders, send a supplier purchase order for each approved
  order, and list each changed order for customer notification.
- An administrator approves or denies PENDING orders on `/admin/orders` and sends them with Commit.

Read the change's `design.md` § Sprint planning first: Codebase findings, Decisions P1–P9 and
Spec discrepancies SD1–SD6. The locked `tests/acceptance/order-approval/harness.ts` is the
interface contract.

## Steps (in `tasks.md` order)

1. **Data model (1.1, 1.2)**
   - Add `purchase_order`, `order_manager`, `order_line`, `message_outbox` and `admin_session` to
     `src/db/schema.ts`. Generate the migration `drizzle/0005_*` and commit it (P1, P3, P5).
   - Add `src/approval/env.ts` with the `ApprovalEnv` type (P3).
   - Add `src/approval/orders.ts`: `ORDER_STATUSES`, `recordOrderStatus` (checks the value in code)
     and `getOrderStatus` (P1, P2).
   - Add `src/approval/documents.ts`: write and read the `OrderApproval` document (P8).
2. **Automatic approval (2.1–2.3)**
   - `policy.ts`: `canApprove`. US is `en_US`, Japan is `ja_JP`, the limits are strict.
   - `receive.ts`: `receivePurchaseOrder`. It stores the order and its lines, registers it PENDING,
     and forwards an APPROVED decision only when the order qualifies.
   - `decision.ts`: `forwardDecision` puts one message per order on the approval queue.
3. **Approval processing (3.1–3.4)**
   - `handler.ts`: `processApprovalMessage`. A non-PENDING order is skipped. A PENDING order gets
     its new status in both `order_manager` and `purchase_order.status` and goes on `notifyList`.
     An APPROVED order also gets a supplier purchase order on `supplierQueue`.
   - `supplier.ts`: `buildSupplierOrderXml` (P7).
   - `dispatch.ts`: `dispatchApprovals(env)` drains the approval queue in-process and writes every
     message to `message_outbox` (P3).
   - Hand-off in `src/app/api/checkout/orders/route.ts`: after `recordOrder`, call
     `receivePurchaseOrder`, then `dispatchApprovals` (P4).
4. **Administrator decisions (4.1, 4.2)**
   - `src/admin/session.ts`: `createAdminSession`, `requireAdmin` and the admin session check
     (P5).
   - `/admin/login` page and `POST /api/admin/login` (P5).
   - `/admin/orders` page with `src/components/admin/OrderApprovalView.tsx` (P6).
   - Routes: `POST /api/admin/approvals`, `GET /api/admin/approvals/sent` and
     `GET /api/admin/orders/[id]` (P6).
   - Demo orders in `src/approval/demo.ts`, called from `prepareDatabase` (P9).
5. **Tests**
   - A unit test beside every new module.
   - A route test beside every new route. Extend the checkout route test: a qualifying order reads
     APPROVED and a large one reads PENDING.
   - A component test for `OrderApprovalView`: choices are held until Commit; non-PENDING rows
     have no controls; Commit carries only the changed rows.
   - `e2e/approval.spec.ts`: sign in, approve one order, Commit, see the after-Commit summary.
   - The locked order-approval suites (Jest and browser) pass unedited.
   - The checkout, customer-accounts, shopping-cart, catalog and site-shell suites keep passing.

## Design reference

Approved mockups, exported to `artifacts/SWHM2-S-0006/design/` (see `MANIFEST.md`):

| File | Route and state | Viewport |
|---|---|---|
| `mockup-order-approval-pending-orders-with-uncom.html` (SWHM2-MCK-45) | `/admin/orders`, signed in, three rows changed and not committed | 1440×900 |
| `mockup-order-approval-after-commit.html` (SWHM2-MCK-46) | `/admin/orders` after Commit: summary of the approved and denied orders | 1440×900 |
| `mockup-order-approval-pending-orders-with-uncom-mobile.html` (SWHM2-MCK-47) | `/admin/orders`, changes not committed | 390×844 |
| `mockup-order-approval-after-commit-mobile.html` (SWHM2-MCK-48) | `/admin/orders` after Commit | 390×844 |

Build what the mockups show inside the app's shell: no own header or sidebar.
- **Desktop:**
  - status tabs
  - the "Changes stay on this page until you press Commit" note
  - the counts row (pending orders, unsent changes, selected)
  - the bulk bar
  - a table with columns Order ID, User ID, Order date, Total, Current status and Change to,
    where "Change to" is a three-way toggle
  - Discard changes and Commit
  - the after-Commit summary listing approved and denied ids
- **Mobile:** each order as a card with the same toggle. Commit and Discard stay reachable at the
  foot of the screen.

Three deliberate differences:
- The default tab is All (SD2).
- The Commit button is named "Commit", with the count beside it (SD3).
- There is no navigation entry (P6).

## File/module ownership

- `src/approval/**` (new)
- `src/admin/session.ts` and its test (new)
- `src/db/schema.ts`, `drizzle/0005_*`, `drizzle/meta/*` and `src/db/prepare.ts`
- `src/app/api/checkout/orders/route.ts` and `route.test.ts`
- `src/app/(DashboardLayout)/admin/login/page.tsx` and `src/app/(DashboardLayout)/admin/orders/page.tsx` (new)
- The new routes and their tests:
  - `src/app/api/admin/login/route.ts`
  - `src/app/api/admin/approvals/route.ts`
  - `src/app/api/admin/approvals/sent/route.ts`
  - `src/app/api/admin/orders/[id]/route.ts`
- `src/components/admin/**` (new)
- `e2e/approval.spec.ts` (new)
- `artifacts/SWHM2-S-0006/SWHM2-T-0029/**`

Not owned:
- `tests/acceptance/**` (locked)
- `openspec/**`
- `src/shell/menu.ts`
- `src/app/(DashboardLayout)/admin/page.tsx` (Administration of orders owns it)

## Definition of Done

- AC-1 to AC-16 on the ticket hold. Each is one scenario of the delta spec, and each case
  SWHM2-C-0021 to C-0036 has a test whose title carries its key.
- Placing an order through checkout leaves a matching `purchase_order` row. A small `en_US` order
  is APPROVED with a supplier purchase order in the outbox.
- The suites listed in step 5 that passed before this change still pass.
