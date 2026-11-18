## Why

Sprint SWHM2-S-0009 fixes one defect and two improvements left over from the catalog and order sprints:

- **SWHM2-T-0010 (defect).** The shell breadcrumb (`src/shell/Breadcrumbs.tsx`) builds a trail from every URL segment of any path two or more levels deep. Every link it renders points at the segment's prefix, whether or not a page exists there. Catalog pages already render their own "Catalog path" trail (`CatalogCrumbs`, `src/components/catalog/parts.tsx`), so `/catalog/items/<id>`, `/catalog/products/<id>`, `/catalog/categories/<id>` and `/catalog/search` show two trails. The shell trail also links to `/catalog/items`, `/catalog/products` and `/catalog/categories`, which have no page (404). Re-verified by reading the code: the same root cause also gives `/checkout/orders/<id>` a dead "Orders" link to `/checkout/orders`. The shell trail was never specified, which is a SPEC-GAP.
- **SWHM2-T-0009 (improvement).** `POST /api/catalog/populate` writes to the database without any access check. Administrator sessions now exist (`src/admin/session.ts`, with `hasAdminSession` and `unauthorized`), so the endpoint can be restricted.
- **SWHM2-T-0008 (improvement).** The locked internationalisation suite (case SWHM2-C-0169) expects a table `item_detail(item_id, locale, name, description, image)`. The catalog stores `item_details(itemid, locale, list_price, unit_cost, image, descn, attr1..5)`, which has no item name column. This must be settled before SWHM2-I-0010 (localisation) is built.

## What Changes

- **site-shell.** ADDED requirement "Shell breadcrumb trail". The shell does not draw its trail on catalog pages, which carry their own. A shell crumb is a link only when a page exists at its path.
- **catalog-browsing.** MODIFIED requirement "Storefront screens and populate tool". In a production configuration the populate endpoint needs an administrator session. Development and test runs stay open. The empty-catalog message no longer advertises the endpoint.
- **SWHM2-T-0008.** A decision only (design.md D3), recorded here for SWHM2-I-0010. The locked test case SWHM2-C-0169 is amended through the acceptance amendment flow to read the catalog's real tables. This adds no spec delta and no table or view.

## Impact

- Capabilities: `site-shell`, `catalog-browsing`. Internationalisation (SWHM2-I-0010) is affected only through the amended locked test.
- Code: `src/shell/Breadcrumbs.tsx` (+ new test), `src/app/api/catalog/populate/route.ts` (+ its test), `src/components/catalog/CategoryListView.tsx`.
- Locked tests: catalog-browsing e2e is unchanged, because it runs against `next dev`. `tests/acceptance/internationalisation/internationalisation.test.ts` is amended by the Test Author (SWHM2-C-0169).
- No schema, migration or dependency change.
