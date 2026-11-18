# SWHM2-T-0010 — Shell breadcrumb duplicates page trails and links to missing pages

Change: `swhm2-s-0009-bugfix-improvement-swhm2-t`. Read `design.md` §D1 first.

## Objective

Show one breadcrumb trail on catalog pages, and make sure no shell crumb links to a page that does not exist. Requirement: **Shell breadcrumb trail** (site-shell).

## Root cause

`src/shell/Breadcrumbs.tsx:15-21` builds a crumb for every URL segment and links every non-last crumb to its prefix path. It does not know which prefixes are pages, and pages that draw their own trail (`CatalogCrumbs`, `src/components/catalog/parts.tsx:33`) cannot turn it off. Re-verified by reading the code. Affected: `/catalog/{items,products,categories}/<id>` and `/catalog/search` (two trails; dead links to `/catalog/items|products|categories`), plus `/checkout/orders/<id>` (dead link to `/checkout/orders`; same cause, folded in).

## Steps

1. In `Breadcrumbs.tsx`, return `null` when the first segment is `catalog` (design.md §D1).
2. Add the exported known-route list, and render a non-last crumb as a `NextLink` only when its href is in that list or is a `MENU_ITEMS` href. Otherwise render plain `Typography` (design.md §D1).
3. Add `src/shell/Breadcrumbs.test.tsx`, mocking `usePathname` as `DashboardShell.test.tsx` does. Cover AC-1 to AC-4, and check that each known-route entry has `src/app/(DashboardLayout)/<path>/page.tsx` on disk.
4. Run the full gate; `DashboardShell.test.tsx` and the catalog e2e must stay green.

## File/module ownership

- `src/shell/Breadcrumbs.tsx` (modify)
- `src/shell/Breadcrumbs.test.tsx` (new)

## Definition of Done

- AC-1 to AC-4 met; each is covered by the new component test.
- Existing shell, catalog and e2e tests are unchanged and green.
