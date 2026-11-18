## Context

Legacy implementation notes only. The catalog is read through an EJB 2 stateless session bean (CatalogEJB) delegating to a DAO (GenericCatalogDAO, CloudscapeCatalogDAO). SQL statements live in the deployment file `CatalogDAOSQL.xml`; the database variant is selected by configured identifier.

## User interface

No screen records were extracted for this capability; its user interface is unspecified. Pass evidence mentions storefront JSP pages for categories, products, items and search, and a populate servlet, but only as file names (low confidence, record CAT-REQ-0001). A separate pass states lists show two rows at a time with next/previous links and a list price plus a lower member price on the item page; that text conflicts with the consolidated wording and needs a person to decide.

## Legacy implementation notes

- Paging: scrollable ResultSet `absolute(start+1)`, reading `count` rows, flagging whether a next page exists. A page size of zero or less still returns one entry because the first row is read before the count check (CB-BR-0003, not carried as a requirement; suspected defect).
- Ordering: categories and products ordered by name in SQL; GET_ITEMS has no `order by`, so item order is database-defined.
- Locale: queries filter on the locale string `Locale.toString()`; a missing localized row yields null, with no fallback. The text `default` means the server default locale.
- Search: GenericCatalogDAO does not lower-case keywords while the SQL lower-cases columns (suspected defect); CloudscapeCatalogDAO lower-cases keywords. Keywords are de-duplicated; each yields three LIKE parameters OR-ed. Tokenising in the DAO uses whitespace; the internationalisation component offers locale-aware word-boundary splitting (INTL-REQ-0006).
- Schema: list price need not be at or above unit cost (no CHECK).
- Errors: data-access failures surface as a system error with the underlying message.

## Sprint planning — SWHM2-S-0002

One FEATURE, **SWHM2-T-0007**, owns every line of `tasks.md`, in order. Plan:
`artifacts/SWHM2-S-0002/SWHM2-T-0007/PLAN.md`. Approved mockups:
`artifacts/SWHM2-S-0002/design/` (see `MANIFEST.md` there).

### Codebase findings

- No catalog code exists. `src/db/schema.ts` holds only `users`; `drizzle/` has one migration
  (`0000_moaning_liz_osborn.sql`). `src/db/prepare.ts` migrates and seeds users;
  `src/db/client.ts` `getDb()` returns a libsql Drizzle db (SQLite file).
- `/catalog` is a placeholder (`src/app/(DashboardLayout)/catalog/page.tsx` renders
  `PlaceholderPage`). The nav entry "Catalog & search" → `/catalog` is in `src/shell/menu.ts` and
  the path is fixed (ARCHITECTURE.md §Key Decisions).
- Shared frames exist: `EmptyFrame`, `ErrorFrame` (Retry), `LoadingFrame`, `PageHeading` in
  `src/components/frames/`; `(DashboardLayout)/error.tsx` renders the error frame for any page
  whose server component throws.
- The locked acceptance suite is already on the branch: `tests/acceptance/catalog-browsing/`
  (`harness.ts` is the contract; `catalog-browsing.test.ts` covers C-0001…C-0017, C-0019, C-0020;
  `e2e/catalog-browsing.spec.ts` covers C-0018). It fixes table/column names, module paths under
  `src/catalog/`, function signatures, the `Page` shape and `POST /api/catalog/populate`.
- The acceptance browser run (`playwright.acceptance.config.ts`, :3101) uses `next dev` against
  the default `sqlite.db`, so the populate route must write through `getDb()`.
- Runtime files: `next.config.ts` `outputFileTracingIncludes` lists `./drizzle/**`; the
  `Dockerfile` copies `drizzle/`. A sample XML file read at run time needs the same two entries.

### Decisions

- **P1 Tables follow the harness exactly**: `category`, `category_details`, `product`,
  `product_details`, `item`, `item_details`, columns as documented at the top of
  `tests/acceptance/catalog-browsing/harness.ts`, ids `text` (≤10), locale `text`, prices
  `real`/numeric (read back as JS numbers), composite PKs `(id, locale)`, FKs to the parent,
  `NOT NULL` where the harness says, indexes on `product(catid)` and `item(productid)`, no CHECK
  between list price and unit cost (R-0148). Defined in `src/db/schema.ts`; migration generated
  into `drizzle/`. SQLite foreign keys must be ON for every connection (C-0006/C-0007 need it):
  verify libsql's default and, if it is off, enable it where the connection is opened.
- **P2 Queries run as statements through `db.all` / `db.get`**, never the Drizzle query builder.
  The statement set (P3) holds the SQL as Drizzle `sql` fragments; `queries.ts`/`search.ts`
  execute them with `db.all(...)`. Reason: C-0010 hands the functions a stub that only has
  `all/get/run/execute`; a query-builder call would throw a `TypeError` without the store's
  message. Every store call is wrapped so a rejection becomes `CatalogSystemError` (an `Error`
  subclass in `src/catalog/errors.ts`) whose message contains the underlying message (R-0053).
- **P3 Dialect selection** (R-0009): `src/catalog/dialect.ts` exports `statementsFor(id)` returning
  a frozen, memoised statement set `{ id, ... }` for `"cloudscape"` and `"oracle"`; an unknown id
  throws. The catalog uses `statementsFor(process.env.CATALOG_DATABASE_ID ?? "cloudscape")`. The
  `cloudscape` set is the one that runs on this stack's SQLite (standard SQL, `LIMIT/OFFSET`); the
  `oracle` set carries the Oracle wording (`OFFSET … ROWS FETCH NEXT … ROWS ONLY`) and is never
  executed here. See D1.
- **P4 Paging**: a request is `{ locale, offset, size }`; a `Page<T>` is `{ entries, hasNext }`.
  Fetch `size + 1` rows to compute `hasNext`. Negative offset or `size <= 0` → empty page without
  querying (R-0052; the legacy "size 0 returns one row" defect is not carried). Offset past the
  end naturally returns `[]`.
- **P5 Ordering**: categories and products `ORDER BY name`; items and search results
  `ORDER BY itemid` so paging is stable. The spec leaves item order unspecified, and a
  deterministic order satisfies that (open question 1).
- **P6 Search** (R-0123, R-0057, R-0058): `splitKeywords(text, locale)` splits on Unicode
  whitespace, drops blank tokens and de-duplicates (case-insensitively). For locales whose script
  has no spaces (`ja*`, `zh*`), each whitespace token is further segmented with `Intl.Segmenter`
  (`granularity: "word"`, `isWordLike` only). It must NOT segment Latin tokens on punctuation:
  C-0017 searches `cat-f` and expects only category `CAT-F`. `searchItems` returns
  `{ entries: [], hasNext: false }` before touching `db` when there are no keywords. Matching is
  `lower(column) LIKE '%' || lower(?) || '%'` over product name, category id and item
  description, ANY keyword (OR), in the requested locale. Both sides are lower-cased (open
  question 2; the Generic DAO defect is not carried). Escape `%`/`_` in keywords.
- **P7 Single lookups** (R-0056): `getCategory`, `getProduct`, `getItem` return `null` when no
  row exists in that locale; no fallback locale.
- **P8 CatalogItem** (R-0149) = `{ categoryId, productId, productName, itemId, image,
  description, attr1..attr5, listPrice, unitCost }`; the item list, item lookup and search all
  return it.
- **P9 Locale**: until Localisation ships, the storefront uses `en_US` (PRD default,
  `Locale.toString()` form). Sample data is loaded for `en_US`. Functions take the locale as an
  argument; no default inside `src/catalog/`.
- **P10 Populate tool** (R-0147): `data/catalog/sample-catalog.xml` (new) holds the sample
  categories, products and items (`en_US`), including category "Fish" → product "Angelfish" →
  item "EST-1" (locked e2e). `src/catalog/populate.ts` parses it (a small dependency-free parser
  for this fixed shape; no new npm dependency) and upserts it inside one transaction, so running
  it twice changes nothing. `POST /api/catalog/populate` calls it and answers
  `{ categories, products, items }` counts. `prepareDatabase` does NOT auto-load it: the catalog
  stays empty until populate runs, and the empty frame says so. Add the XML to
  `outputFileTracingIncludes` and copy it in the `Dockerfile`. Customer sample data is
  customer-accounts' (SWHM2-I-0003), not this sprint's. See D2.
- **P11 Screens** (server components, data read on the server, page size **10** (open question 3)):
  `/catalog` (categories, each a link), `/catalog/categories/[id]` (products),
  `/catalog/products/[id]` (items table), `/catalog/items/[id]` (item detail),
  `/catalog/search?q=` (results + search box). Paging via `?page=` (1-based) with Previous/Next and
  an "Items 1–4"-style range; a page number past the end shows the empty frame. Unknown id → the
  empty frame ("not found") with a link back, never the error frame. Store failure → throw;
  `(DashboardLayout)/error.tsx` shows the error frame with Retry. Breadcrumbs as drawn. The
  search box is a plain GET form, so it works without client JS. The `/catalog` placeholder is
  replaced at the same path.

### Phases (all SWHM2-T-0007, in `tasks.md` order)

1. **Data model** (1.1–1.4): schema + generated migration (P1).
2. **Catalog queries** (2.1–2.5): `dialect.ts`, `errors.ts`, `queries.ts` (P2–P5, P7, P8).
3. **Search** (3.1–3.3): `keywords.ts`, `search.ts` (P6).
4. **Configuration and errors** (4.1–4.2): identifier from `CATALOG_DATABASE_ID`, error wrapping
   (P2, P3). In practice it is built alongside phase 2.
5. **Storefront** (5.1–5.2): pages, components, populate tool and route (P10, P11).
6. **Test harness**: unit tests beside each new `src/catalog/*.ts` (node env), component tests for
   the new views, a route test for `POST /api/catalog/populate`, and one Playwright spec in `e2e/`
   for the browse → search journey. The locked suite in `tests/acceptance/catalog-browsing/` runs
   unedited. Route/DB tests restore the seeded state they change.
7. **CI**: `.github/workflows/ci.yml` already runs unit, e2e and both acceptance tiers on
   `vortex/**` pushes and PRs. No CI change is planned; the CI job only has to pass.

### Spec discrepancies

- **D1 Dialects** (R-0009): the spec names Cloudscape and Oracle; this stack runs SQLite only.
  The locked C-0004 tests selection by identifier only. Both sets exist, and only `cloudscape`
  (written SQLite-compatible) ever executes.
- **D2 Populate scope** (R-0147): "catalog and customer sample data". Customer tables do not
  exist until customer-accounts, so this sprint loads catalog data only.
- **D3 Keyword splitting**: R-0123 says whitespace; R-0058 says locale word boundaries. Resolved
  by P6 (whitespace, plus word segmentation only for ja/zh), which is also what C-0015 and C-0017
  require.
- **D4 Paging text**: the legacy pass's "two rows at a time" and "member price" text is not
  carried. The approved mockups show list price only, page size is 10, and there is no member
  price.
- **D5 Unit cost on screen**: the brief says each item shows its unit cost, but the approved
  mockups do not draw it. The item detail's Details list adds a "Unit cost" row. Nothing else
  deviates from the mockup.
- **D6 Out of scope in the mockups**: "Add to cart" on item detail (shopping-cart, SWHM2-I-0004;
  PRD non-goal for catalog) and the header language switcher (internationalisation,
  SWHM2-I-0010) are not built here.
- **D7 Cross-capability table name**: the locked internationalisation suite (not this sprint)
  expects `item_detail(item_id, locale, name, description, image)`, while this sprint's locked
  harness fixes `item_details(itemid, …)` with no item name. The internationalisation sprint
  must reconcile them, for example with a view or a test amendment. This sprint's harness wins
  here.
- **D8 Locale strings**: the legacy filter uses `Locale.toString()` (`en_US`); the locked tests
  pass `"en"`. Functions take the locale verbatim; the storefront and sample data use `en_US` (P9).
