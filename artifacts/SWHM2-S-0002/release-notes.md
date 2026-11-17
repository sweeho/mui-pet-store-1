---
artifact: release-notes
sprint: SWHM2-S-0002
ticket: SWHM2-T-0012
author: planning
---

# Release notes — SWHM2-S-0002

## Shoppers can find a pet

**Catalog & search** is now a working area. It used to open a "not available yet" page. Content
is in US English (`en_US`) until Localisation ships.

### New

- **Categories** (`/catalog`): every category, sorted by name, with a link to each.
- **Products in a category** (`/catalog/categories/<id>`): the category's products, sorted by name.
- **Items of a product** (`/catalog/products/<id>`): each item's ID, attributes, description and
  list price.
- **Item detail** (`/catalog/items/<id>`): the image, description, up to five attributes, list
  price and unit cost, plus the item's product and category.
- **Search** (`/catalog/search?q=…`):
  - An item matches if any one word appears in its product name, category code or description.
  - Upper and lower case are ignored.
  - A blank search shows an empty result straight away.
- **Paging** on every list: 10 per page, with Previous and Next.
- **Clear empty and error states:**
  - A page past the end, an empty search, or an unknown category, product or item shows the
    shared empty frame. It explains what to try next.
  - If the catalog store cannot be reached, the shared error frame appears with **Retry**.
- **Sample data:** `POST /api/catalog/populate` loads the bundled sample catalog (5 categories,
  16 products and 26 items). Running it again changes nothing.

### Not available yet

- **Add to cart** arrives with the Cart capability.
- The language switcher has no effect yet, because only US English content exists.
- The catalog stays empty until the sample-data load has been run once.

### For developers

- Catalog modules are in `src/catalog/`; screens are under `src/app/(DashboardLayout)/catalog/`
  and `src/components/catalog/`.
- Catalog SQL runs through a statement set chosen by `CATALOG_DATABASE_ID` (default
  `cloudscape`). Store failures surface as `CatalogSystemError` carrying the store's message.
- New migration: `drizzle/0001_free_boom_boom.sql` adds six catalog tables and indexes on
  `product(catid)` and `item(productid)`.
- The sample data is in `data/catalog/sample-catalog.xml`, and the Docker image copies it to
  `/app/data/catalog`.

### Known issues

- The populate route needs no sign-in (SWHM2-T-0009).
- If a volume is mounted over `/app/data`, it hides the sample XML (SWHM2-T-0013).

The evidence comes from `qa-test-report.md`:
- Unit suite: 17 suites and 54 tests passed.
- E2E: 7 tests passed.
- The locked catalog-browsing acceptance tests pass.
