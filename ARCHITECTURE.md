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
seeds two demo users when the table is empty.

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
- **Demo users**: the template's `users` table. Customers do not use it; it stays only for the
  template's `/api/users` routes.

## Sessions and protected pages

Every page in the shell reads the web session on the server. A session idle for 15 minutes is
ended on its next request. A page that needs a customer calls `requireSignOn(path)` from
`src/accounts/web-session.ts`, which redirects an anonymous visitor to
`/signon?returnTo=<path>`. After sign-on the visitor returns to that path, which must be on this
site. Forms post to route handlers, which set cookies and answer with redirects.

## Integration points

- **Sample data**: `POST /api/catalog/populate` loads `data/catalog/sample-catalog.xml` into the
  catalog tables, idempotently. It is the catalog's only write path until batch operations ships an
  inventory load.

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
  `swhm2-i-0002-catalog-browsing-and-search` (design.md, P1, P9).
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
- **Address and card storage belong to checkout.** `src/checkout/store.ts` owns `address` and
  `credit_card`, and customer-accounts calls it. Rationale: both locked suites fix those
  functions there, and checkout extends them. Authored in change
  `swhm2-i-0003-customer-accounts-and-sign` (design.md, P3).
