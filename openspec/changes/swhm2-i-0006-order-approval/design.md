## Context

Legacy implementation notes for order-approval. Recovered from the OPC order-processing bean and the admin client.

## Legacy implementation

- PurchaseOrderMDB (`legacy-source/app/src/apps/opc/.../PurchaseOrderMDB.java`) persists the order, registers it PENDING with the process manager, then calls `canIApprove`. Limits are hard-coded literals (US < 500, Japan < 50000, strict less-than), not configurable; the runbook agrees on the values. Any other locale falls through to false.
- An automatic approval is published as an order-approval message to the order-approval queue, so it follows the same path as an administrator decision.
- The approval message is an OrderApproval document of Order entries (OrderId, OrderStatus). The approval handler processes each entry only when the current status is PENDING; APPROVED entries additionally produce a supplier purchase order, and every changed order is listed for customer notification.
- The admin rich client keeps status choices locally until Commit, then sends one order-approval message asynchronously and replies SUCCESS without waiting for application of the status.
- Status is stored one value per order id in the process-manager table (PENDING, APPROVED, DENIED, COMPLETED; up to 20 characters per the DDL).

## Open points

- The admin user documents describe PENDING as "total exceeds the region limit", while the code also leaves non-US/JP orders PENDING; the code was followed.
- Limits are bare literals with no authoritative configuration source.

## User interface

No screen records were extracted for this capability; its user interface is unspecified. The admin client behaviour is stated only as workflow requirements.

## Sprint planning (SWHM2-S-0006)

Planned on SWHM2-T-0028. One FEATURE builds the whole change; its key tags every `tasks.md` line.

### Codebase findings

- **No approval code exists.** `src/approval/` is absent. The locked suite
  `tests/acceptance/order-approval/` imports `@/approval/{env,orders,policy,receive,decision,handler}`;
  its `harness.ts` fixes every module name, signature and table name. It is the build contract.
- **Orders are recorded by checkout only.** `POST /api/checkout/orders`
  (`src/app/api/checkout/orders/route.ts`) writes `checkout_order` and `checkout_order_line`
  through `recordOrder` (`src/checkout/store.ts`). Ids are text from the `1001` sequence (`10011`,
  `10012`, ...). The locale is the session language (`en_US`, `ja_JP`, ...), the total is
  `sum(quantity * unitPrice)`. Nothing hands the order on today.
- **The approval tables do not exist.** The approval harness (and the locked suites of
  admin-order-management, order-fulfilment and batch-operations) all use `purchase_order`,
  `order_manager` and `order_line`, with integer ids in their inserts. Their column needs
  (union, from each `harness.ts`):
  - `purchase_order(order_id, user_name, order_time epoch ms, locale, total_price, status)`;
    `status` takes values outside the four (admin's harness inserts `NEW`).
  - `order_manager(order_id, status)` with **no unique key** (admin's harness inserts several
    rows per order, or none).
  - `order_line(order_id, line_num, category_id, product_id, item_id, quantity, unit_price)`;
    admin's and batch's harnesses insert only `item_id` and `quantity`, so `category_id`,
    `product_id` and `unit_price` must be nullable.
- **No admin sign-in exists.** `/admin` is the bootstrap placeholder
  (`src/app/(DashboardLayout)/admin/page.tsx`). The locked browser cases C-0027–C-0029 sign in at
  `/admin/login` as `j2ee`/`j2ee` (or `ADMIN_USER`/`ADMIN_PASSWORD`), then use `/admin/orders`,
  `GET /api/admin/approvals/sent` and `GET /api/admin/orders/{id}`. No `j2ee` account is seeded in
  `sign_on`. Admin-order-management's harness already names `src/admin/session.ts`
  `createAdminSession()` and the cookie `admin_session`.
- **Shared XML helpers exist.** `src/checkout/documents.ts` has a private `escapeText` and an
  element writer; the supplier document can reuse the same approach (no XML dependency).
- **Database preparation** is `prepareDatabase` (`src/db/prepare.ts`), run once per process. The
  acceptance Playwright run (`playwright.acceptance.config.ts`, :3101) uses the project's
  `sqlite.db`, which persists between local runs; the acceptance Jest run copies a prepared
  database per file (`src/db/acceptance-setup.ts`).
- **Navigation.** `src/shell/menu.ts` has Admin → `/admin`. The locked site-shell case C-0226
  visits every navigation link; a client-redirecting protected page there made it flaky in
  SWHM2-S-0005.
- **CI** (`.github/workflows/ci.yml`) runs on pull requests to `vortex/**`, `dev`, `main` and runs
  the unit, E2E and acceptance tiers. No CI change is needed.

### Decisions

- **P1 Order-processing tables.** One migration adds:
  - `purchase_order(order_id text PK, user_name, order_time integer ms, locale, total_price real,
    status text)`; `status` mirrors the latest process-manager status and is not constrained.
  - `order_manager(order_id text, status text)`: no primary or unique key (admin-order-management's
    harness). `recordOrderStatus` updates every row of the order, or inserts one when none exists.
    `getOrderStatus` reads the most recent row.
  - `order_line(order_id, line_num, category_id null, product_id null, item_id, quantity integer,
    unit_price real null, PK(order_id, line_num))`.
  - Ids are text so checkout's `10011` and the harnesses' integer inserts compare equal under SQLite
    affinity. No foreign keys into `checkout_order` (seeded and harness orders have none).
  - Fulfilment adds its own columns and indexes (`quantity_shipped`, the status and user indexes)
    in its sprint; this change adds only what it reads.
- **P2 Status values are checked in code.** `ORDER_STATUSES` is the four values;
  `recordOrderStatus` throws for anything else (C-0021). No CHECK constraint on `order_manager`:
  fulfilment's own `SHIPPED_PART` lives in its own table, and a constraint would make that
  sprint's migration rebuild the table.
- **P3 Queues are arrays on an env; the outbox persists them.**
  - `ApprovalEnv` (`src/approval/env.ts`) is `{ db, now, approvalQueue, supplierQueue, notifyList }`
    plus an optional `origin: "auto" | "admin"` (default `"auto"`). The library functions only
    push onto the arrays, as the harness expects.
  - `dispatchApprovals(env)` (`src/approval/dispatch.ts`) is the in-process consumer: it takes each
    message off `approvalQueue`, records it, runs `processApprovalMessage`, then writes every
    supplier purchase order and notification to the outbox.
  - New table `message_outbox(id autoincrement, queue text, origin text, order_id text, body text,
    created_at integer)`. Queue names: `order-approval`, `supplier-purchase-order`,
    `customer-notification`. Fulfilment and notifications read their queue from it when they
    ship.
- **P4 Checkout hands the order on.** After `recordOrder`, `POST /api/checkout/orders` calls
  `receivePurchaseOrder` with the same order id, user, locale, total and lines (category and
  product from the catalog item it already reads), then `dispatchApprovals`. A qualifying order is
  APPROVED before the confirmation page renders. The confirmation page's "awaiting approval" text
  (SD4 of `swhm2-i-0005-checkout-and-payment-detail`) is not changed in this sprint.
- **P5 Minimal admin sign-in** (SD1):
  - `/admin/login`: fields labelled "User ID" and "Password", button "Sign in". `POST
    /api/admin/login` answers 303 to `/admin/orders`, or back to `/admin/login?error=1` with an
    error message.
  - Credentials come from `ADMIN_USER` / `ADMIN_PASSWORD`, defaulting to `j2ee` / `j2ee` (the
    locked specs' defaults).
  - `src/admin/session.ts` `createAdminSession(userName?)` inserts an `admin_session(session_id
    PK, user_name, created_at)` row and returns its id; the cookie is `admin_session` (HttpOnly).
  - `requireAdmin()` redirects on the server (`redirect("/admin/login")`) so no client redirect
    happens.
  - Administration of orders (SWHM2-I-0009) later adds the home page, logout and the error page on
    top of this, and keeps the session contract.
- **P6 The approval screen** (`/admin/orders`, mockup SWHM2-MCK-45 to MCK-48):
  - A server page lists **every** order, newest first, as `tr[data-order-id][data-status]` (SD2).
    The status tabs (All, Pending, Approved, Denied, Completed) filter by `?status=`; the default is
    All.
  - A PENDING row has a three-way toggle Pending / Approved / Denied (`ToggleButtonGroup`, buttons,
    not a select). Other rows show their status as text, with no control.
  - Row checkboxes and the bulk bar "Set selected orders to Approved / Denied / Pending" act on
    selected PENDING rows only.
  - Choices stay in client state. "Discard changes" resets them. The **Commit** button's
    accessible name is exactly "Commit" (SD3); the change count is shown beside it, not in it.
  - Commit sends `POST /api/admin/approvals` with JSON
    `{ decisions: [{ orderId, status }] }` holding only the changed rows. The route calls
    `forwardDecision` once per decision (one message per order) with `origin: "admin"`, then
    `dispatchApprovals`, and answers `{ sent: n, approved: [...], denied: [...] }`. The page shows
    the after-Commit summary (MCK-46) and refreshes.
  - `GET /api/admin/approvals/sent` returns `{ messages: [{ orderId, status }] }`, read from
    `message_outbox` rows with queue `order-approval` and origin `admin`, oldest first.
    Automatic approvals from parallel checkouts are not counted.
  - `GET /api/admin/orders/{id}` returns `{ orderId, userName, orderTime, locale, total, status }`
    or 404.
  - Every admin route answers 401 without an admin session.
  - No navigation entry is added (C-0226; the same issue as SWHM2-S-0005). `/admin` stays I-0009's
    placeholder.
- **P7 Supplier purchase order document.** `buildSupplierOrderXml` (`src/approval/supplier.ts`)
  writes `<SupplierOrder>` with `<OrderId>`, `<OrderDate>` (yyyy-MM-dd), `<ShippingInfo>` (from the
  matching `checkout_order` ship-to when present, otherwise empty) and one `<LineItem>` per
  `order_line`, holding `<CategoryId>`, `<ProductId>`, `<ItemId>`, `<LineNum>`, `<Quantity>` and
  `<UnitPrice>`. These are the element names order-fulfilment's harness reads.
- **P8 Approval message document.** `<OrderApproval>` holding `<Order><OrderId/><OrderStatus/></Order>`
  entries, the harness's `approvalXml` form. The handler reads entries by name and skips an entry
  whose status is not APPROVED or DENIED.
- **P9 Demo orders for the approval screen.** `prepareDatabase` keeps at least **4 PENDING** and
  **1 APPROVED** demo order (ids `DEMO-0001`, ... ; user `j2ee`; locale `en_US`; total ≥ 500; two
  lines from the sample catalog). It inserts only the shortfall, so the number of rows is bounded.
  It runs at each server start, so a reused local `sqlite.db` still has the three PENDING orders
  C-0027 needs. The Jest acceptance run resets the tables, so these rows do not reach the
  harness tests.

### Phases (in `tasks.md` order)

1. **Data model** (1.1–1.2): schema + migration (P1), `orders.ts` (P2), `env.ts`, the approval
   document (P8).
2. **Automatic approval** (2.1–2.3): `policy.ts`, `receive.ts`, `decision.ts`.
3. **Approval processing** (3.1–3.4): `handler.ts`, `supplier.ts` (P7), `dispatch.ts` + outbox (P3),
   then the checkout hand-off (P4).
4. **Administrator decisions** (4.1–4.2): admin session and login (P5), the screen and its routes
   (P6), demo orders (P9).
5. **Test harness:**
   - Unit tests beside each `src/approval/*` module and `src/admin/session.ts`.
   - Route tests beside each new `route.ts`, plus the checkout route test extended for the hand-off.
   - A component test for the approval view.
   - One project Playwright spec `e2e/approval.spec.ts`: sign in, approve one order, Commit, see
     the after-Commit summary.
   - The locked `tests/acceptance/order-approval/` suite (Jest and browser) passes unedited.
6. **CI:** no workflow change. The existing pull-request job runs every tier above on the ticket's
   pull request to `vortex/**`.

## Spec discrepancies

Recorded here, not edited into the delta spec. Also posted on SWHM2-T-0028.

- **SD1 Admin sign-in is out of scope, but the locked cases need it.** The brief places admin
  sign-in and the order list in Administration of orders (SWHM2-I-0009). The locked cases
  C-0027–C-0029 sign in at `/admin/login` and read `/admin/orders`. This change builds the minimum
  (P5, P6) on I-0009's own session contract, so I-0009 extends it and does not replace it.
  Admin credentials come from the environment with `j2ee`/`j2ee` defaults, because no admin role or
  account exists in the data. This is a security point for I-0009 and the Business Owner.
- **SD2 The mockup lists only PENDING orders.** MCK-45 shows the Pending tab with only pending rows.
  C-0028 expects an APPROVED row on `/admin/orders` without any interaction, so the default view
  is All, and the tabs filter.
- **SD3 Commit button label.** The mockup's button reads "Commit 3 changes". The locked specs find
  it by `/^commit( changes)?$/i`, so the button is named "Commit" and the count sits beside it.
- **SD4 Legacy notes vs code.** The legacy admin documents call PENDING "total exceeds the region
  limit", but the code also holds every non-US/JP order. The spec follows the code (R-0175,
  R-0171), and so does this build.
- **SD5 Total currency.** The limits are bare numbers compared with `total_price`. Checkout totals
  catalog list prices in one currency whatever the locale, so a `ja_JP` order is compared with
  50000 in the catalog's currency. This matches the legacy store, which compared the stored total
  as-is. Localisation (SWHM2-I-0010) may change how prices are shown, but not this rule.
- **SD6 Admin decisions apply at once.** Legacy sent the message asynchronously and replied before
  the status changed. Here the Commit route dispatches in-process, so the status has changed when
  the page refreshes. The visible result (only changed orders are sent, non-PENDING orders are
  ignored) is the same.
