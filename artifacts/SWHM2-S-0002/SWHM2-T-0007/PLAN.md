# PLAN — SWHM2-T-0007 Catalog browsing and search

Change: `swhm2-i-0002-catalog-browsing-and-search`. Read its `design.md` FIRST, in particular the
"Sprint planning — SWHM2-S-0002" section (P1–P11, D1–D8). Requirements: all 20 in
`specs/catalog-browsing/spec.md` (SWHM2-R-0001, -0007, -0008, -0009, -0019 … -0022, -0052 …
-0058, -0122, -0123, -0147 … -0149).

## Objective

Give shoppers a catalog: the six catalog tables, locale-filtered paged listings, single lookups,
keyword search, store-failure handling, five storefront screens, and a sample-data populate tool.
It covers all 16 `tasks.md` lines.

## Steps

1. Data model (1.1–1.4): design.md P1. Add the six tables and two indexes to `src/db/schema.ts`
   and generate the migration. Make sure foreign keys are enforced on the connection.
2. Catalog queries and configuration/errors (2.1–2.5, 4.1–4.2): P2–P5, P7, P8. Build
   `src/catalog/errors.ts`, `dialect.ts` and `queries.ts`, and execute statements through
   `db.all`/`db.get` only.
3. Search (3.1–3.3): P6. Build `src/catalog/keywords.ts` and `search.ts`. Make sure `cat-f` stays
   one token.
4. Storefront (5.1–5.2): P10, P11. Add the sample XML, `populate.ts`, the populate route, and the
   five pages with their views. Replace the `/catalog` placeholder. Add the XML to tracing and the
   Dockerfile.
5. Test harness: design.md §Phases 6. Add unit, component, route and one Playwright journey
   test. Then run the locked suite unedited.
6. CI: no change. See design.md §Phases 7.

## Fixed interface contracts

These are fixed by the locked harness (`tests/acceptance/catalog-browsing/harness.ts`). Do not
change them.

- Tables and columns as the harness header states. Ids are text ≤10. Composite PKs are
  `(id, locale)`. Indexes are `product(catid)` and `item(productid)`. There is no
  list-price/unit-cost check.
- `type PageRequest = { locale: string; offset: number; size: number }`;
  `type Page<T> = { entries: T[]; hasNext: boolean }`.
- `CatalogItem = { categoryId, productId, productName, itemId, image, description, attr1..attr5:
  string | null, listPrice: number, unitCost: number }`.
- `src/catalog/queries.ts` exports these functions:
  - `listCategories(db, page) → Page<{id,name}>`
  - `listProducts(db, categoryId, page) → Page<{id,categoryId,name}>`
  - `listItems(db, productId, page) → Page<CatalogItem>`
  - `getCategory(db, id, locale) → {id,name} | null`
  - `getProduct(db, id, locale) → {id,categoryId,name,image,description} | null`
  - `getItem(db, itemId, locale) → CatalogItem | null`
- `src/catalog/search.ts`: `searchItems(db, query, page) → Page<CatalogItem>`. A blank query
  never touches `db`.
- `src/catalog/keywords.ts`: `splitKeywords(text, locale) → string[]` (sync).
- `src/catalog/dialect.ts`: `statementsFor(id: "cloudscape" | "oracle" | string)` returns a
  memoised set with `.id`. An unknown id throws.
- Every async catalog function rejects with an `Error` whose message contains the store's
  message.
- `POST /api/catalog/populate` returns 200 with
  `{ categories: number, products: number, items: number }`. Running it again is harmless.
- Routes: `/catalog`, `/catalog/categories/[id]`, `/catalog/products/[id]`,
  `/catalog/items/[id]`, `/catalog/search?q=`. Every screen takes `?page=` (1-based).

## File / module ownership

- `src/db/schema.ts` (add catalog tables), `src/db/client.ts` (schema map; FK pragma only if
  needed), new `drizzle/0001_*.sql` + `drizzle/meta/*`
- New `src/catalog/`: `errors.ts`, `dialect.ts`, `queries.ts`, `keywords.ts`, `search.ts`,
  `populate.ts`, `types.ts`, each with a `*.test.ts`
- New `data/catalog/sample-catalog.xml`
- New `src/app/api/catalog/populate/route.ts` + `route.test.ts`
- `src/app/(DashboardLayout)/catalog/page.tsx` (replace placeholder), plus new
  `catalog/categories/[id]/page.tsx`, `catalog/products/[id]/page.tsx`,
  `catalog/items/[id]/page.tsx` and `catalog/search/page.tsx`
- New `src/components/catalog/*` views (+ `*.test.tsx`), including a shared paging control
- New `e2e/catalog.spec.ts`
- `next.config.ts` (`outputFileTracingIncludes` adds `./data/**`), `Dockerfile` (copy `data/`)
- Not owned: `tests/acceptance/**` (locked), `openspec/**` except ticking nothing (the platform
  ticks `tasks.md`), `src/shell/**`, `src/components/frames/**` (reuse, do not change),
  `.github/workflows/ci.yml`.

## Design reference

Approved mockups are in `artifacts/SWHM2-S-0002/design/` (`MANIFEST.md` there lists the route and
state of each):

- `mockup-catalog-category-list[-mobile].html`: `/catalog` with categories listed, 1440 / 390.
- `mockup-catalog-products-in-a-category[-mobile].html`: `/catalog/categories/[id]` with products
  listed, 1440 / 390.
- `mockup-catalog-items-of-a-product[-mobile].html`: `/catalog/products/[id]` with the items
  table, 1440 / 390.
- `mockup-catalog-item-detail[-mobile].html`: `/catalog/items/[id]` with an item found,
  1440 / 390. Do not build "Add to cart" (D6). Add a "Unit cost" row (D5).
- `mockup-catalog-search-results[-mobile].html`: `/catalog/search?q=retriever`, 1440 / 390.

Empty, error and loading states use the shared frames (`artifacts/SWHM2-S-0001/design/`
`mockup-empty-state*.html`, `mockup-error-state*.html`). Colours come from theme tokens only.

## Definition of Done

All of AC-1 … AC-20 on the ticket are met (one per scenario). Locked cases SWHM2-C-0001 …
SWHM2-C-0020 pass unedited. The app builds, and its own unit and e2e suites stay green.
