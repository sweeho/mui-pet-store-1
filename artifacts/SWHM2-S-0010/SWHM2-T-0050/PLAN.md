# PLAN — SWHM2-T-0050 Administration of orders

Change `swhm2-i-0009-administration-of-orders`. Read its `design.md` first, especially the section
"Planning — sprint SWHM2-S-0010" (findings, P1–P10, SD1–SD6). Then read the delta spec
`specs/admin-order-management/spec.md` and the locked suite in
`tests/acceptance/admin-order-management/`. Its `harness.ts` header is the module contract.

## Objective

An administrator can sign in, reach the admin home, list orders by status with a Refresh that
warns before discarding held changes, read revenue or quantity reports as a bar or pie chart,
and log out. The rich-client XML endpoint and the launch descriptor answer as the spec states.
This covers every task in `tasks.md`, groups 1 to 5, in order.

## Steps

1. **Access and session** (tasks 1.1–1.3; design P1–P3, P8 session check).
   - Add `endAdminSession` to `src/admin/session.ts`.
   - Login success redirects to `/admin`, failure to `/admin/login/error`.
   - Add `POST /api/admin/logout`.
   - Guard `/admin` with `requireAdmin()`.
   - Update the two project tests that pin the old landing (`src/app/api/admin/routes.test.ts`,
     `e2e/approval.spec.ts`).
2. **Screens and launch** (tasks 2.1–2.2; P2, P9, P10).
   - Admin home `AdminHomeView`: **Launch Rich Client** → `/admin/orders`, the Orders by status
     and Sales reports cards, and a **Log out** form button.
   - `/admin/login/error` outcome page.
   - Add `/admin/login` to `KNOWN_PAGE_ROUTES`.
   - `src/admin/launch.ts` and `POST /api/admin/process`.
3. **Request protocol** (task 3.1; P8): `src/admin/protocol.ts` (reader, dispatcher, XML writer) and
   `POST /api/admin/appl`.
4. **Orders** (tasks 4.1–4.3; P4, P5): `src/admin/orders.ts` over `v_order_status`, and a **Refresh**
   button in `OrderApprovalView` with the `window.confirm` warning.
5. **Sales reports** (tasks 5.1–5.2; P6, P7): `src/admin/reports.ts`, the `/admin/reports` page,
   `SalesReportView` and `SalesChart`.
6. **Tests and CI** (design Phases 6–7). Add a test beside every new module, route and component,
   plus the project spec `e2e/admin.spec.ts`. No CI change.

**Locked cases C-0240 and C-0243.** These fail in the harness's own setup: it inserts catalog
columns that do not exist (SD2). As your first action, file one `target: "test"` dispute on
SWHM2-C-0243 with `case_keys` [C-0240, C-0243], `path`
`tests/acceptance/admin-order-management/harness.ts` and `line` 81. Ask for this amendment:
- `insertItem` seeds `category(catid)`, `product(productid, catid)`, `item(itemid, productid)`
  and `item_details(itemid, 'en_US', list_price, unit_cost, image, descn)`.
- `resetData` also clears `item_details` before `item`.
- The expectations stay unchanged.

Planning could not file it, because a dispute must come from the ticket that owns the cases.
Code `reports.ts` to the real schema, cover it with your own `reports.test.ts`, and do not edit
the locked files or add schema to fit them.

## File/module ownership

New:
- `src/admin/orders.ts`, `reports.ts`, `launch.ts` and `protocol.ts`, each with a `.test.ts`
- `src/app/api/admin/appl/route.ts`, `process/route.ts` and `logout/route.ts`, each with a
  `route.test.ts`
- `src/app/(DashboardLayout)/admin/login/error/page.tsx`
- `src/app/(DashboardLayout)/admin/reports/page.tsx`
- `src/components/admin/AdminHomeView.tsx`, `SalesReportView.tsx` and `SalesChart.tsx`, with tests
- `e2e/admin.spec.ts`

Modify:
- `src/admin/session.ts` (+ `session.test.ts`)
- `src/app/api/admin/login/route.ts`
- `src/app/api/admin/routes.test.ts`
- `src/app/(DashboardLayout)/admin/page.tsx`
- `src/components/admin/OrderApprovalView.tsx` (+ test)
- `src/shell/Breadcrumbs.tsx` (the `KNOWN_PAGE_ROUTES` entry only)
- `e2e/approval.spec.ts` (the landing URL only)

## Design reference

Mockups are in `artifacts/SWHM2-S-0010/design/` (see `MANIFEST.md`). Render each route beside its
mockup:

| Mockup | Route and state | Viewport |
|---|---|---|
| `mockup-admin-sign-in.html` / `-mobile` | `/admin/login`, signed out | 1440 / 390 |
| `mockup-admin-sign-in-error.html` / `-mobile` | `/admin/login/error` | 1440 / 390 |
| `mockup-admin-home.html` / `-mobile` | `/admin`, signed in | 1440 / 390 |
| `mockup-orders-by-status.html` / `-mobile` | `/admin/orders?status=PENDING` with held changes | 1440 / 390 |
| `mockup-sales-reports.html` / `-mobile` | `/admin/reports?start=10/01/2026&end=10/31/2026&type=REVENUE` | 1440 / 390 |

Known divergences:
- The refresh warning is the browser's confirm, not the drawn dialog (SD1).
- The mockup's sidebar "Orders / Sales reports" entries are not added (P10).
- Cards use 8px corners and controls 4px (brief build note).

## Definition of Done

- AC-1 to AC-15 on the ticket hold, one per scenario, in the order of the spec.
- Every new module, route and component has a test beside it, and `e2e/admin.spec.ts` has been
  run.
- The locked admin-order-management suite passes, except C-0240 and C-0243 while their amendment
  is open.
- The order-approval, order-fulfilment and site-shell locked specs stay green.
- No new dependency, table, view or column.
