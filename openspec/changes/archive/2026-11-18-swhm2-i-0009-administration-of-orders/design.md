# Legacy implementation notes

- Access control: `web.xml` security-constraint on `/AdminRequestProcessor` (role `administrator`, FORM login `login.jsp`). The rich-client endpoint `/ApplRequestProcessor` is not constrained and relies on a session-exists check in `ApplRequestProcessor.java` (suspected defect: weaker than the console).
- Screens: `login.jsp`, `index.jsp`, error page. The home form posts `currentScreen=manageorders` to `AdminRequestProcessor`, which returns a Web Start descriptor (host, port, session id as arguments).
- Rich client: `PetStoreAdminClient`, `OrdersApprovePanel`, `DataSource`, `HttpPostPetStoreProxy` post XML to `ApplRequestProcessor`; request types GETORDERS, UPDATESTATUS, REVENUE, ORDERS.
- Order listing: `OPCAdminFacadeEJB.getOrdersByStatus`; date formatted manually M/D/YYYY; FinderException wrapped in OPCAdminFacadeException. `ProcessManagerEJB`/`ManagerEJB` supply orders by status.
- Charts: `OPCAdminFacadeEJB.getChartInfo`; any request other than REVENUE is treated as quantity; revenue uses Float arithmetic.
- DB: view `V_ORDER_STATUS` (inner join PURCHASE_ORDER to ORDER_MANAGER) in `petstore_oracle.sql`.
- Session timeout of 54 minutes appears in a competing pass (not an approved record); unverified.
- Discrepancy: REQ-0001 refers to a "form-based login" while rich-client requests rely only on session presence.

## Planning — sprint SWHM2-S-0010

One FEATURE, SWHM2-T-0050, owns every line of `tasks.md`. Its plan is
`artifacts/SWHM2-S-0010/SWHM2-T-0050/PLAN.md`, and the approved mockups are under
`artifacts/SWHM2-S-0010/design/`.

### Codebase findings

- **Admin session exists** (`src/admin/session.ts`, change `swhm2-i-0006-order-approval`).
  `createAdminSession`, `isAdminSession`, `hasAdminSession(request)`, `unauthorized()` (401) and
  `requireAdmin()` (server redirect to `/admin/login`). The credentials come from
  `ADMIN_USER`/`ADMIN_PASSWORD`, defaulting to `j2ee`/`j2ee`. The `admin_session` table has one row
  per sign-in. There is no logout, and nothing ever deletes a row.
- **Sign-in** (`src/app/api/admin/login/route.ts`). A form POST answers 303 to `/admin/orders` on
  success and to `/admin/login?error=1` on failure. `/admin/login/page.tsx` shows the form with
  the labels "User ID" and "Password" and the button "Sign in", and shows an inline alert on
  `?error`. Two project tests pin the current landing: `src/app/api/admin/routes.test.ts:47-54`
  and `e2e/approval.spec.ts:9`.
- **`/admin` is a placeholder** (`PlaceholderPage`) with no guard. `/admin/orders` calls
  `requireAdmin()` and renders `OrderApprovalView` (`src/components/admin/`). That view holds
  Approved/Denied choices until **Commit** and has a **Discard changes** button, but no
  **Refresh**. Its rows read `purchase_order.status`.
- **Order tables** (`src/db/schema.ts`):
  - `purchase_order(order_id numeric, user_name, order_time ms, locale, total_price, status)`.
  - `order_manager(order_id, status)`, with no unique key.
  - `order_line(order_id, line_num, category_id?, product_id?, item_id, quantity, unit_price?, quantity_shipped)`.
- **The view `v_order_status` exists** (`drizzle/0006_demonic_roulette.sql:73`). It inner-joins
  each order to its **latest** `order_manager` row (MAX rowid), so it gives one row per order that
  has a status. `src/fulfilment/orders.ts:195` already reads it.
- **Catalog keys** are `category(catid)`, `product(productid, catid)` and
  `item(itemid, productid)`. List price and unit cost live per locale in
  `item_details(itemid, locale, list_price, unit_cost, …)`.
- **Demo orders** (`src/approval/demo.ts`, seeded by `src/db/prepare.ts`) give every new database
  at least four PENDING orders, so the browser specs have rows to act on.
- **Navigation.** `src/shell/menu.ts` has one Admin entry, "Administration of orders" → `/admin`.
  `src/shell/Breadcrumbs.test.tsx:46` asserts that title. The `KNOWN_PAGE_ROUTES` list in
  `src/shell/Breadcrumbs.tsx` decides which intermediate crumbs are links.
- **Dependencies.** There is no chart library and no XML parser in `package.json`. The supplier
  endpoint (`src/app/api/supplier/`) already handles XML by hand.
- **The locked suite** (`tests/acceptance/admin-order-management/`) fixes the module and route
  names. `harness.ts` is the contract: `src/admin/{orders,reports,launch}.ts`,
  `POST /api/admin/appl` and `POST /api/admin/process`.

### Decisions

- **P1 — Guard per page, no proxy.** `/admin`, `/admin/orders` and `/admin/reports` call
  `requireAdmin()`. `/admin/login` and `/admin/login/error` stay open. Admin API routes check
  `hasAdminSession`. The brief's `src/proxy.ts` is rejected because the per-page guard is the
  existing pattern, and the shell's locked navigation check relies on a server redirect.
- **P2 — Sign-in lands on the admin home.** A successful sign-in answers 303 to `/admin`, which C-0234
  and C-0242 need: they expect "Launch Rich Client" right after sign-in. A failed sign-in answers
  303 to `/admin/login/error`. That is a new outcome page following DESIGN.md "Forms and outcome
  pages": a heading, the sentence from the mockup, **Back to sign in** (`/admin/login`) and **Go to
  the store home page**. `/admin/login` joins `KNOWN_PAGE_ROUTES`, because it becomes an
  intermediate crumb. The two project tests that pin the old landing are updated.
- **P3 — Logout.** `POST /api/admin/logout` deletes the `admin_session` row, expires the cookie and
  answers 303 to `/admin/login`. The home page's **Log out** is a form button posting there. A new
  `endAdminSession(db, id)` goes in `session.ts`.
- **P4 — Order listing reads `v_order_status`.**
  - `listOrderOperations(db)` returns every row of the view.
  - `listOrdersByStatus(db, status)` returns the view's rows for one status. The view already
    gives one row per order (R-0121). The view decides an order's current status: an order whose
    latest status row is APPROVED is not listed as PENDING, even if an older row was PENDING.
  - Each row is `{ orderId, userId, date, value, status }`. The date is `M/D/YYYY` in server
    local time, unpadded as R-0040 and C-0237 fix it. `orderId` is the stored value, a number for
    numeric ids.
  - The `/admin/orders` page keeps reading `purchase_order.status`, as Order approval built it
    (change `swhm2-i-0006-order-approval` P6). This capability adds Refresh to that screen and
    does not move its data source.
- **P5 — Refresh warning uses the browser's confirm.** `OrderApprovalView` gains a **Refresh**
  button.
  - With no held changes it calls `router.refresh()`.
  - With held changes it calls `window.confirm` with a message naming the uncommitted changes and
    that refreshing discards them. OK discards and refreshes. Cancel changes nothing.
  - The mockup draws an in-page dialog ("Keep changes" / "Discard and refresh"). The locked spec
    C-0232 waits for a native browser `dialog` event, which an MUI Dialog never raises. See SD1.
- **P6 — Sales reports.** `src/admin/reports.ts` exports `salesReport` and `getChartInfo`, one
  query for both.
  - **Dates:** strict `^\d{2}/\d{2}/\d{4}$` and a real calendar date. Anything else returns
    `{ error }`, naming `MM/dd/yyyy`. The range covers start 00:00 local up to, but not including,
    the day after the end.
  - **Rows:** `order_line` → `purchase_order` (date range) → `item` → `product`. Rows group by
    `product.catid`, or by `item.itemid` within one `catid` when a category is given.
  - **Totals:** REVENUE totals `quantity × item_details.list_price`, using the price for the
    order's locale. Any other type totals `quantity` (R-0138).
  - **Scope:** every order in the range counts, whatever its status (brief assumption; open
    question unchanged).
  - **Output:** rows sorted by value, descending, with `total` as the sum of the rows.
- **P7 — Reports screen is a server-rendered GET form.** `/admin/reports` reads its query string
  (start, end, type, category), runs `salesReport` on the server and passes the result to
  `SalesReportView`. Only the Bar/Pie toggle is client state. The chart is a small SVG component
  of the app's own (`SalesChart`), coloured from the theme palette. This adds no dependency:
  the brief's alternative `@mui/x-charts` is not needed for one bar chart and one pie.
- **P8 — Rich-client protocol, no new dependency.** `POST /api/admin/appl` does the following:
  - **No valid admin session:** 401 with an XML body carrying the exact
    `SESSION_TIMEOUT_MESSAGE`. Nothing else runs (R-0142, C-0241, C-0244).
  - **Parsing:** the body's `<Type>` and its flat child elements are read by a small hand-written
    reader in `src/admin/protocol.ts`, in the style of the supplier endpoint.
  - **GETORDERS:** one `<Order>` element per order (OrderId, UserId, OrderDate, OrderValue,
    OrderStatus) plus `<Count>`.
  - **UPDATESTATUS:** passes `<Order><OrderId/><Status/></Order>` decisions to the same path as
    `POST /api/admin/approvals` (`forwardDecision` and `dispatchApprovals`).
  - **REVENUE / ORDERS:** run `salesReport` with Start/End/Category.
  - **Any other Type:** 400 with `<Error>` naming it.
  - Every value is XML-escaped.
- **P9 — Launch descriptor kept as an API.** `buildLaunchDescriptor` returns JNLP text titled "Pet
  Store Admin" with three `<argument>` elements: server, port and session id, each XML-escaped.
  `POST /api/admin/process` does the following:
  - It requires an admin session, answering 401 otherwise.
  - On `currentScreen=manageorders` it answers 200 with `application/x-java-jnlp-file`. The
    server is the request URL's hostname, and the port is the URL's port or 80/443 by protocol.
  - Any other screen gets 400.
  - On the admin home, **Launch Rich Client** opens `/admin/orders`, following the brief's flow and
    the wireframes. Whether to keep the desktop client stays open (brief Q1).
- **P10 — Navigation unchanged.** The single Admin entry "Administration of orders" → `/admin`
  stays. The brief says the area must not appear as two entries. The home page links to Orders
  and Sales reports, as the mockup's cards do.

### Phases

1. **Access and session** (tasks 1.1–1.3): P1, P2, P3, and the session check of P8.
2. **Screens and launch** (tasks 2.1–2.2): home, login error page, P9.
3. **Request protocol** (task 3.1): P8.
4. **Orders** (tasks 4.1–4.3): P4, P5.
5. **Sales reports** (tasks 5.1–5.2): P6, P7.
6. **Test harness.** Each new module and route gets a test beside it, following AGENTS.md's
   table: `src/admin/*.test.ts`, route tests beside each `route.ts` with
   `@jest-environment node`, and component tests for `AdminHomeView`, `SalesReportView` and the
   Refresh behaviour of `OrderApprovalView`. One project browser spec, `e2e/admin.spec.ts`, covers
   sign-in → home → reports → logout. The locked suite is run unchanged.
7. **CI.** `.github/workflows/ci.yml` already runs on `vortex/**` pushes and pull requests,
   including the unit, E2E and both acceptance tiers, and uploads the JUnit results. No workflow
   change is planned. The FEATURE is done when that pipeline is green on its pull request.

### Spec discrepancies

- **SD1 — Refresh warning form.** The mockup (SWHM2-MCK-57) draws an in-page dialog. The locked
  test C-0232 listens for a native browser dialog. The build follows the locked test (P5), and
  the design keeps the mockup's wording.
- **SD2 — The harness's catalog columns do not exist.** `tests/acceptance/admin-order-management/harness.ts`
  inserts `category(category_id)`, `product(product_id, category_id)` and
  `item(item_id, product_id, list_price, unit_cost)`. The real catalog uses `catid`, `productid`
  and `itemid`, and keeps prices per locale in `item_details`. So C-0240 and C-0243 fail in
  setup, before any product code runs. This is the same conflict recorded for the
  batch-operations and internationalisation harnesses (`swhm2-s-0009-bugfix-improvement-swhm2-t`,
  D3 and F1). It is raised as a `target: "test"` amendment on C-0240 and C-0243: seed the real
  catalog tables and clear `item_details` in `resetData`. The build codes to the real schema (P6)
  and adds no table, view or column to fit the harness.
- **SD3 — Rich client vs. web screens.** R-0038 and R-0039 describe a Java Web Start launch
  descriptor for a desktop client that this repository does not have. The descriptor is built as
  an API, because C-0235 and C-0236 test it. The administrator's **Launch Rich Client** opens the
  web orders screen (P9). Brief Q1 remains open.
- **SD4 — "Form-based login" vs. session-only rich-client check.** The legacy notes flag the rich
  client's check as weaker than the console's. Here both use the same `admin_session` check, so
  the discrepancy does not carry over.
- **SD5 — Date format.** The brief says the order list shows MM/dd/yyyy. R-0040 and C-0237 fix
  unpadded M/D/YYYY (`1/5/2020`). The library follows the spec. The `/admin/orders` screen keeps
  the format Order approval gave it.
- **SD6 — Session timeout of 54 minutes** (legacy note, unverified). It is not adopted: the
  admin session has no idle expiry today. Only a missing or deleted session counts as timed out.
