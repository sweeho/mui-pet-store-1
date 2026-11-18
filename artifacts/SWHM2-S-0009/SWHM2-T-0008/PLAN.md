# SWHM2-T-0008 — Reconcile i18n `item_detail` with catalog `item_details`

Change: `swhm2-s-0009-bugfix-improvement-swhm2-t`. Read `design.md` §D3 first. The decision has been made: Option A.

## Objective

Have the locked internationalisation test for case SWHM2-C-0169 amended so that it reads the catalog's real tables. No second table or view is added. Related requirement: **Item localised details** (SWHM2-R-0001). This adds no spec delta.

## Approach (confirmed against the code)

- `tests/acceptance/internationalisation/internationalisation.test.ts:17,121-128` inserts into `item_detail(item_id, locale, name, description, image)`. That table exists nowhere in `src/` or `drizzle/`. The catalog has `item_details(itemid, locale, list_price, unit_cost, image, descn, …)` and `product_details(productid, locale, name, …)` (`drizzle/0001_free_boom_boom.sql`).
- `src/i18n/` does not exist yet, so the i18n suite cannot pass until SWHM2-I-0010 builds it, whatever this ticket does. This ticket only removes the schema conflict.
- `tests/acceptance/batch-operations/harness.ts` creates and drops its own `item_detail`, so it is unaffected by Option A (design.md §D3).

## Steps

1. File `a2a_dispute_test_case(target="test", ticket_key="SWHM2-T-0008", case_key="SWHM2-C-0169", path="tests/acceptance/internationalisation/internationalisation.test.ts", line=121)`. The reason quotes design.md §D3: seed `category`/`product`/`product_details`/`item`/`item_details` with en_US and zh_CN rows, and keep the `getCatalogItem` contract and the zh_CN expectations.
2. Do not edit the locked file, add a table, add a view or create `src/i18n/`.
3. Record in the work log the dispute id and the amended suite version once the Test Author answers.

## File/module ownership

- None in the repository. The locked test is changed only by the Test Author's amendment.

## Definition of Done

- AC-1 met: the amendment is filed with the design.md §D3 seeding, and no table or view named `item_detail` is added under `src/` or `drizzle/`.
