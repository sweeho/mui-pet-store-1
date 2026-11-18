## Context

Bugfix and improvement sprint SWHM2-S-0009. Per-ticket plans: `artifacts/SWHM2-S-0009/<TICKET-KEY>/PLAN.md`.

Code read:
- `src/shell/Breadcrumbs.tsx`: crumbs for every segment; the fallback title is the capitalised segment; every crumb except the last is a `NextLink`.
- `src/shell/DashboardShell.tsx:56`: renders the shell trail above every page.
- `src/components/catalog/parts.tsx:33`: `CatalogCrumbs`, used by every catalog view (category, product and item lists, search, not-found).
- Pages under `src/app/(DashboardLayout)/`: `account`, `accounts` (redirect), `accounts/create`, `accounts/create-error`, `admin`, `admin/inventory`, `admin/login`, `admin/orders`, `cart`, `catalog`, `catalog/search`, `catalog/{categories,items,products}/[id]`, `checkout`, `checkout/orders/[id]`, `signon`, `signon/error`.
- `src/app/api/catalog/populate/route.ts`, `src/admin/session.ts`, `src/db/client.ts:61-64`: a new database file is populated automatically on first use.
- `tests/acceptance/internationalisation/internationalisation.test.ts:17,121-128`, `tests/acceptance/batch-operations/harness.ts`, `drizzle/0001_free_boom_boom.sql`.

## Decisions

### D1 — Shell breadcrumb: catalog opt-out plus links only to real pages (SWHM2-T-0010)

- `Breadcrumbs` returns `null` when the first path segment is `catalog`. Every catalog view renders `CatalogCrumbs`, and the approved catalog mockups show only that trail.
- A non-last crumb is rendered as a link only when its path is a known page route. Otherwise it is plain text (`Typography`, `color="text.secondary"`), so the trail keeps its shape but nothing in it 404s.
- "Known page route": one exported constant in `Breadcrumbs.tsx` that lists the intermediate paths that have a `page.tsx` (`/account`, `/accounts`, `/admin`, `/cart`, `/catalog`, `/checkout`, `/signon`), plus every `MENU_ITEMS` href. A unit test checks each listed path against `src/app/(DashboardLayout)/<path>/page.tsx` on disk, so the list cannot point at a missing page.
- Rejected: a per-page opt-out prop or context. It needs every catalog page to change and does not fix the dead links elsewhere (`/checkout/orders`).
- Effect outside the catalog: `/checkout/orders/<id>` shows "Orders" as text rather than a dead link. Admin, account and sign-on trails are unchanged, because all their intermediate segments are real pages.

### D2 — Populate endpoint: administrator session in production (SWHM2-T-0009)

- `POST(request: Request)`. When `process.env.NODE_ENV === "production"` and `hasAdminSession(request)` is false, return `unauthorized()` (401, `{ error: "administrator sign-in required" }`) before touching the database. In any other `NODE_ENV` the call is allowed as today.
- Why development and test stay open: the locked catalog-browsing e2e (`tests/acceptance/catalog-browsing/e2e/catalog-browsing.spec.ts:5`) and `e2e/catalog.spec.ts:5` call the endpoint anonymously against `next dev` (both Playwright configs start `next dev`, so `NODE_ENV=development`). Jest runs with `NODE_ENV=test`. No locked-test amendment is needed.
- First run in production does not depend on the endpoint: `getDb()` populates a new database file itself (`src/db/client.ts:61-64`).
- 401 rather than 403 reuses the existing `unauthorized()` helper used by the admin API routes.
- The route test switches `NODE_ENV` with `jest.replaceProperty(process.env, "NODE_ENV", "production")` and creates a session with `createAdminSession()`, sending it as the `admin_session` cookie.
- The empty-catalog message in `CategoryListView.tsx` drops the endpoint, reading: "No categories have been loaded yet. An administrator can load the sample data." The title "The catalog is empty" is unchanged; `catalog-views.test.tsx` asserts it.

### D3 — i18n item details: amend the locked test to the catalog schema (Option A) (SWHM2-T-0008)

- Chosen: **Option A**. Case SWHM2-C-0169 ("Name, description and image come from the zh_CN row") is satisfied by the catalog's real tables. The item name is `product_details.name` of the item's product for that locale, the description is `item_details.descn`, and the image is `item_details.image`. The locked test is amended to seed `category`/`product`/`product_details`/`item`/`item_details` rows (en_US and zh_CN) instead of inserting into `item_detail`. The `getCatalogItem(db, itemId, locale) => { name, description, image }` contract is unchanged.
- Rejected: **Option B** (a read-only `item_detail` view). It adds a second name for the same data that can drift from the catalog, and the catalog's NOT NULL price columns make a writable view impossible anyway: the test INSERTs into the table.
- The test is amended by the Test Author through the amendment flow. SWHM2-T-0008 files the `target: "test"` dispute on SWHM2-C-0169 that requests it. Nobody edits the locked file directly.
- Batch-operations harness: unaffected by this choice. It defines and drops its own `item_detail` (and differently-named catalog columns) in its own DDL. Its conflict with the real catalog schema is out of scope (see the sprint's follow-ups).
- SWHM2-I-0010 planning must read this decision; it is promoted to `ARCHITECTURE.md ## Key Decisions` because it binds that later change.

## Risks

- D1: a future intermediate page added without updating the route list renders as text, not a dead link. The failure is safe.
- D2: a deployment that runs `next start` with a different `NODE_ENV` is treated as production. That is intended.
