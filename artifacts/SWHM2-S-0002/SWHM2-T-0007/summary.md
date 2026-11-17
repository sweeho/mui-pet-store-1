# Summary — SWHM2-T-0007 Catalog browsing and search

CODE-REVIEW: self-review — sub-agent not run in this session; reviewed the diff against the spec for paging, escaping of LIKE input, error wrapping and server/client module boundaries; fixed a `PAGE_SIZE` import from a client module that made every server listing empty.

## What changed
- Six catalog tables and two indexes (`src/db/schema.ts`, migration `drizzle/0001_free_boom_boom.sql`); foreign keys are on by default in libsql.
- `src/catalog/`: `dialect.ts` (cloudscape/oracle sets, `CATALOG_DATABASE_ID`), `errors.ts`, `queries.ts`, `keywords.ts`, `search.ts`, `populate.ts`, `screen.ts`, `types.ts`. Statements run through `db.all`; store failures become `CatalogSystemError` with the store's message.
- `src/db/client.ts`: `run/all/get` rethrow Drizzle's wrapped error with the store's message first (the locked tests match on constraint text).
- Five screens under `/catalog` with `?page=` paging (size 10), views in `src/components/catalog/`; unknown id shows the empty frame; store failure throws to the shared error frame.
- `POST /api/catalog/populate` loads `data/catalog/sample-catalog.xml` (en_US) in one transaction, idempotent. `Dockerfile` copies the XML into the image (no `next.config.ts` change: that would count as a runner config change).
- `e2e/home.spec.ts`: the placeholder check now uses `/cart`, since `/catalog` is a real page.

## Deviations
- Item order is by item id; search results omit the mockup's Description column; Unit cost row added, Add to cart not built (D5, D6). See `design-check.md`.
- Dockerfile copies the XML to `/app/data/catalog`; a volume mounted over `/app/data` would hide it.

## AC coverage
AC-1 … AC-20 map to cases SWHM2-C-0001 … C-0020; all pass in own tests and the locked suite.

## Verification
- `node .vortex/check-versions.mjs && npm run verify:full` → exit 0.
- `npm run test:acceptance` → 21 passed. `npm run test:acceptance:e2e` → catalog spec passed; 4 other-capability specs (order-fulfilment, shopping-cart) fail and are outside this ticket.
