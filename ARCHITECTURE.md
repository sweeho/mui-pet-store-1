# Architecture

## Stack

- **Runtime**: Node.js and npm, at the versions in `stack.versions.yaml`
- **Framework**: Next.js App Router: server-rendered pages and API route handlers in one app
- **UI**: React and MUI, with the Modernize Free admin shell in `src/shell/` and one theme built
  from `design/tokens.mui.json`
- **Database**: Drizzle ORM over SQLite (libsql, a file) or PostgreSQL (`DATABASE_URL`, or a
  throwaway local cluster in development and tests)
- **Tests**: Jest through `next/jest` (jsdom for components, node for routes and the database),
  Playwright end to end, Stryker for mutation testing
- **Packaging**: a Docker image of Next.js's standalone server, run as the non-root `node` user

## Data flow

A request for a page runs its server component, which reads through `src/lib/` and `getDb()` and
renders MUI components inside the shell. An API route (`src/app/api/**/route.ts`) does the same and
answers JSON. The browser calls the API with `withBasePath()`, so the app works under the staging
preview's path prefix (`NEXT_BASE_PATH`).

`getDb()` (`src/db/client.ts`) connects once per process, applies the migrations in `drizzle/` and
seeds what an empty database needs: the demo users, the sample catalog, the approval demo orders
and a starting stock for every catalog item.

Domain logic lives in one folder per capability under `src/` (`src/catalog/` first). Pages and API
routes call those modules with the db from `getDb()`. The modules take the db as their first
argument, so tests can hand them a test or stub db.

## Data model

The schema is `src/db/schema.ts`; migrations are generated into `drizzle/`.

- **Catalog**: `category` → `product` → `item`, each with a per-locale details table
  (`category_details`, `product_details`, `item_details`) keyed by `(id, locale)`. Localised
  content lives only in the details rows. A lookup in a locale with no row finds nothing, with no
  fallback. Prices and the five item attributes are on `item_details`. Foreign keys are enforced.
  Behaviour: `openspec/specs/catalog-browsing/` once change `swhm2-i-0002-catalog-browsing-and-search`
  is archived.
- **Customers**: `sign_on(username, password)` is the credential, keyed by user name.
  `customer(user_id)` uses the same key and links to one `account` and one `profile`.
  `account` holds the status (`active` / `disabled`) and links to one `contact`, which links to
  one `address`, and to one `credit_card`. Passwords are stored as supplied (the spec of record
  keeps legacy behaviour until the Business Owner decides). Behaviour:
  `openspec/specs/customer-accounts/` once change `swhm2-i-0003-customer-accounts-and-sign` is
  archived.
- **Web sessions**: `web_session` holds one row per browser session: the signed-on user name, the
  session and cart language, and the last access time. The `pet_session` cookie carries only the
  row's random id.
- **Shopping carts**: `shopping_cart` holds one row per visit's cart: the item-id→quantity map
  and the last access time. The `pet_cart` cookie carries only the row's random id, so a cart
  exists before sign-on and survives it. A cart idle for 15 minutes reads as empty. Rules live in
  `src/cart/`; behaviour: `openspec/specs/shopping-cart/` once change `swhm2-i-0004-shopping-cart`
  is archived.
- **Orders**: `checkout_order` holds one row per placed order: id, user, e-mail, date, locale,
  total, the ship-to and bill-to contacts as snapshots, and the card the order carries;
  `checkout_order_line` holds its lines and goes with it on delete. The card the customer typed is
  kept separately in `payment_card`. `sequence` holds named counters; order ids are the sequence
  name followed by its count. Behaviour: `openspec/specs/checkout-and-payment/` once change
  `swhm2-i-0005-checkout-and-payment-detail` is archived.
- **Order processing**: `purchase_order` (one row per order handed to approval: id, user, time,
  locale, total, latest status; indexed on user and time), `order_line` (its lines, keyed by order
  and line number, with the quantity shipped) and `order_manager` (the process-manager status,
  checked in code; indexed on status). The view `v_order_status` joins an order to its status.
  Checkout writes the same order id here after `checkout_order`. Approval, fulfilment,
  administration and batch jobs all read these tables. Behaviour: `openspec/specs/order-approval/`
  once change `swhm2-i-0006-order-approval` is archived.
- **Supplier fulfilment**: `supplier_order` (one row per order sent to the supplier: id, date,
  status, shipping contact), `supplier_order_line` (its lines, with the quantity shipped),
  `contact_info` (the shipping contact, address included), `inventory` (one stock quantity per
  item, never below zero), `order_status` (one status per order id) and `counter` (named integer
  counters for identifiers). Behaviour: `openspec/specs/order-fulfilment/` once change
  `swhm2-i-0007-order-fulfilment-and-invoic` is archived.
- **Message outbox**: `message_outbox` holds every message one stage hands to the next (queues
  `order-approval`, `supplier-purchase-order`, `customer-notification`, `supplier-invoice`,
  `completed-order`), with its origin and order id.
- **Admin sessions**: `admin_session` holds one row per administrator sign-in; the
  `admin_session` cookie carries only its id.
- **Demo users**: the template's `users` table. Customers do not use it; it stays only for the
  template's `/api/users` routes.

## Sessions and protected pages

Every page in the shell reads the web session on the server. A session idle for 15 minutes is
ended on its next request. A page that needs a customer calls `requireSignOn(path)` from
`src/accounts/web-session.ts`, which redirects an anonymous visitor to
`/signon?returnTo=<path>`. After sign-on the visitor returns to that path, which must be on this
site. Forms post to route handlers, which set cookies and answer with redirects.

Admin pages (`/admin/**` other than `/admin/login` and `/admin/login/error`) call
`requireAdmin()` from `src/admin/session.ts`, which redirects to `/admin/login` on the server.
`src/proxy.ts` also answers `/admin`, `/admin/orders` and `/admin/reports` with a 307 to
`/admin/login` when the `admin_session` cookie is absent, before the page streams: a redirect
from a streamed page made Chromium abort the navigation. It checks only that the cookie exists;
the page's `requireAdmin()` still checks the session row, so protection stays on the page.
Admin API routes answer 401 without an admin session. A sign-in lands on the admin home `/admin`
(a failure on `/admin/login/error`), and logout deletes the `admin_session` row, so the next
request asks for sign-in again. An admin session has no idle timeout of its own. A protected page may have a navigation entry only because the
redirect happens on the server: the shell's locked navigation check visits every entry and must
land on a page inside the shell (`/admin/inventory` lands on `/admin/login`).

## Integration points

- **Sample data**: `POST /api/catalog/populate` loads `data/catalog/sample-catalog.xml` into the
  catalog tables, idempotently. It is the catalog's only write path until batch operations ships an
  inventory load. With `NODE_ENV=production` it requires an administrator session (401 otherwise);
  development and test leave it open (change `swhm2-s-0009-bugfix-improvement-swhm2-t`, design D2).

- **Order queues**: stages hand work on through queues, not direct calls. A library function
  pushes onto an array on its env (`ApprovalEnv`), and `dispatchApprovals` (`src/approval/`)
  consumes the order-approval queue in-process and writes everything it produced to
  `message_outbox`. Checkout and the admin Commit route both go through it. Each supplier
  purchase order it records is handed to fulfilment (`src/fulfilment/`), which ships what stock
  allows and records invoices and completed orders in the outbox for notifications.
- **Outbound e-mail**: order notifications (`src/notifications/`) send through an injected mail
  transport. The three order e-mail switches (`NOTIFY_STATUS_CHANGE`, `NOTIFY_INVOICE`,
  `NOTIFY_COMPLETED`) and the sender (`MAIL_FROM`) are deployment settings, all off by default.
  No mail server is configured yet, so a send is logged and dropped. The approval and fulfilment
  dispatchers notify after they write the outbox, so a mail failure never reaches an order.
- **Admin rich-client protocol**: `POST /api/admin/appl` takes a flat XML `<Request>` whose
  `<Type>` is GETORDERS, UPDATESTATUS, REVENUE or ORDERS and answers XML, reusing the admin
  libraries in `src/admin/` that the web screens call. Without an admin session it answers with
  the "Session Timed Out" message and does nothing. `POST /api/admin/process` with
  `currentScreen=manageorders` returns a Java Web Start descriptor naming this server, its port
  and the session id. No desktop client ships with this repository; whether one is kept is open
  for the Business Owner. Behaviour: `openspec/specs/admin-order-management/` once change
  `swhm2-i-0009-administration-of-orders` is archived.
- **Supplier endpoint**: `POST /api/supplier/purchase-orders` accepts a SupplierOrder XML document
  and `GET /api/supplier/purchase-orders/{id}` reports its status. Neither requires a sign-in, as
  the spec of record states; whether that stays is open for the Business Owner.

## Deployment

The `Dockerfile` builds the app with `output: "standalone"` and runs `server.js` under Node as the
`node` user on a base image pinned by digest. `compose.yaml` runs it on :3000; a PostgreSQL
project's Compose file adds a `db` service. With the Helm option, `chart/` deploys the image and
its CI job lints and validates it. Vortex never builds or runs the image: CI's `docker-build` job
does.

## Key Decisions

- **One shell, one navigation.** Every page renders inside `(DashboardLayout)`'s shell; a
  capability adds a `MENU_ITEMS` entry and a page, never its own chrome or menu. Rationale: one
  product, not ten. Authored in change `swhm2-i-0001-bootstrap-landing-page-and` (design.md).
- **Primary-area routes are fixed.** `/catalog`, `/cart`, `/signon`, `/admin/inventory` and
  `/admin` exist from the first sprint as "not available yet" placeholders; the owning capability
  replaces the page at that path, never the path. Rationale: navigation, landing tiles and locked
  acceptance suites already point there. Authored in change
  `swhm2-i-0001-bootstrap-landing-page-and` (design.md, Sprint planning).
- **Shared state frames.** Empty, error and loading states come from `src/components/frames/` via
  each route's `error.tsx` / `loading.tsx`. Rationale: consistent behaviour and one retry path.
  Authored in change `swhm2-i-0001-bootstrap-landing-page-and` (design.md).
- **Catalog reads run through a statement set executed with `db.all`/`db.get`.** The SQL text
  lives in a per-database statement set chosen by `CATALOG_DATABASE_ID`, and every store failure
  is rethrown as an error carrying the store's message. Rationale: the spec makes the dialect
  configurable and failure messages observable, and the locked suite stubs the db at that level.
  Authored in change `swhm2-i-0002-catalog-browsing-and-search` (design.md, P2–P3).
- **Locale-keyed details tables.** Translatable catalog content goes in `*_details` rows keyed by
  `(id, locale)`, never in columns per language. Locale strings use the `en_US` form. Rationale:
  internationalisation and batch loads build on the same rows. Authored in change
  `swhm2-i-0002-catalog-browsing-and-search` (design.md, P1, P9). Localisation reads these
  tables directly (an item's name is its product's `product_details.name`); no `item_detail`
  table or view exists, and the locked i18n test is amended to match. Authored in change
  `swhm2-s-0009-bugfix-improvement-swhm2-t` (design.md, D3). The same rule covers every locked
  harness that writes legacy catalog columns (`category_id`, `item.list_price`): the code reads
  the real catalog (prices from `item_details`) and the harness is amended, never mirrored in the
  schema. Authored in change `swhm2-i-0009-administration-of-orders` (design.md, P6, SD2).
- **Sessions live in the database; protection lives on the page.** The browser holds only a random
  session id; idle timeout, language and sign-on state are in `web_session`, and each protected
  page calls `requireSignOn` rather than a URL list in a proxy. Rationale: server components can
  update a row but not set a cookie, there is no signing secret to manage, and a page cannot be
  left out of a list it does not appear in. Authored in change
  `swhm2-i-0003-customer-accounts-and-sign` (design.md, P6–P7).
- **The cart is a pure model persisted by id.** `src/cart/cart.ts` owns every cart rule over an
  in-memory object; storage only loads and saves it in `shopping_cart`, keyed by its own cookie,
  independent of `web_session`. Rationale: anonymous shoppers have no session row, and checkout
  reads the same model. Authored in change `swhm2-i-0004-shopping-cart` (design.md, P1–P3).
- **An order is a snapshot.** `checkout_order` copies contact, addresses and card into its own
  row, with no foreign keys into `address`, `contact` or `credit_card`. Rationale: a later edit
  to a customer never rewrites a placed order, and approval, fulfilment and notifications read
  one row. Authored in change `swhm2-i-0005-checkout-and-payment-detail` (design.md, P2).
- **Each acceptance test file has its own database.** The acceptance Jest run copies the prepared
  database per test file. Rationale: locked suites reset shared tables and cannot be edited, so
  isolation must come from the runner. Authored in change
  `swhm2-i-0005-checkout-and-payment-detail` (design.md, P10).
- **Address and card storage belong to checkout.** `src/checkout/store.ts` owns `address` and
  `credit_card`, and customer-accounts calls it. Rationale: both locked suites fix those
  functions there, and checkout extends them. Authored in change
  `swhm2-i-0003-customer-accounts-and-sign` (design.md, P3).
- **Stages talk through queues persisted in one outbox.** Each stage's library takes an env of
  in-memory queues; a dispatcher drains them and writes `message_outbox`. Rationale: the locked
  suites inspect the queues directly, and later stages (fulfilment, notifications) consume a
  durable record instead of being called. Authored in change `swhm2-i-0006-order-approval`
  (design.md, P3).
- **One set of order-processing tables.** `purchase_order`, `order_line` and `order_manager` are
  shared by approval, fulfilment, administration and batch operations; each capability adds only
  the columns and indexes it reads, and `order_manager` has no unique key. Rationale: four locked
  suites insert into the same tables with different column subsets. Authored in change
  `swhm2-i-0006-order-approval` (design.md, P1).
- **Supplier orders are their own records; the customer order follows them.** Fulfilment works
  only on `supplier_order` and its lines. When a supplier order completes, it records COMPLETED
  on the customer order of the same id and queues a completed-order message. It never edits the
  approval tables otherwise. Rationale: the legacy supplier and order centre were separate
  systems, and the locked suites test each one on its own tables. Authored in change
  `swhm2-i-0007-order-fulfilment-and-invoic` (design.md, P3, P6).
- **Notifications are best-effort and never fail an order.** A mail is sent once, after the change
  behind it is saved. A failed send is logged and dropped, never retried, and never raised to
  the caller. Rationale: the spec of record drops undeliverable mail, and every order-handling
  capability calls the notifier. Authored in change `swhm2-i-0008-order-notifications`
  (design.md, P4, P8).
