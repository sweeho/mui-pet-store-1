---
artifact: sprint-summary
sprint: SWHM2-S-0002
ticket: SWHM2-T-0012
author: planning
---

# Sprint summary — SWHM2-S-0002

**Goal:** SWHM2-I-0002: Catalog browsing and search. **Outcome: met.** Integration QA passed all
20 scenarios, found no defects, and left no defect open.

## Delivered

| Ticket | Type | What | Status |
|---|---|---|---|
| SWHM2-T-0006 | TASK | Sprint plan: one FEATURE, tagged `tasks.md`, the planning section of `design.md` (P1–P11, D1–D8), 10 mockups exported, and an ARCHITECTURE.md update (catalog data model, Key Decisions) | DONE |
| SWHM2-T-0007 | FEATURE | Six catalog tables and two indexes, paged listings, single lookups, keyword search, store-failure errors, five `/catalog` screens, and `POST /api/catalog/populate` with sample XML | DONE |
| SWHM2-T-0011 | TASK | Integration QA: 20/20 scenarios pass, with no defects | DONE |
| SWHM2-T-0012 | TASK | Sprint close: this summary and the release notes | DONE |

Backlog improvements raised (not in this sprint):
- SWHM2-T-0008: the internationalisation suite's `item_detail` table conflicts with the catalog's `item_details` table.
- SWHM2-T-0009: the populate route is unauthenticated.
- SWHM2-T-0013: the sample XML sits under the database volume path.

## Acceptance

| Scenario group | Cases | Verdict |
|---|---|---|
| Data model: hierarchy, identity, localised details, record completeness, indexes | SWHM2-C-0001 to C-0003, C-0005 to C-0008, C-0019 | pass |
| Dialect selection | SWHM2-C-0004 | pass |
| Listings, paging and lookups: categories, products, items, out-of-range paging, single entry, item exposure | SWHM2-C-0009, C-0011 to C-0013, C-0016, C-0020 | pass |
| Data store failure | SWHM2-C-0010 | pass |
| Search: keyword, blank, keyword splitting | SWHM2-C-0014, C-0015, C-0017 | pass |
| Storefront screens and populate tool | SWHM2-C-0018 (e2e) | pass |

The evidence is in `qa-test-report.md`:
- Unit suite: 17 suites and 54 tests passed, with 92.8% line coverage.
- Project E2E: 7 tests passed.
- Locked catalog-browsing acceptance suite: the Jest tests and the Playwright spec pass.

Locked suites for later capabilities still fail, as expected. They are judged at release UAT.

## Changes beyond the feature

- **`src/db/client.ts`:** `run`, `all` and `get` now put the store's own message first when they rethrow. The locked tests match on the constraint text, and Drizzle's wrapper hid it.
- **`e2e/home.spec.ts`:** the "not available yet" check now uses `/cart`, because `/catalog` is now a real page.
- **Dockerfile:** copies `data/catalog/` into the image. `next.config.ts` was left unchanged.
- **Root docs:**
  - ARCHITECTURE.md was updated at planning (data model, the populate integration point, and two Key Decisions). It still matches what shipped, so it was not changed at close.
  - PRODUCT.md was unchanged, because the capability map already listed catalog-browsing.
  - DESIGN.md was unchanged, because the screens reuse existing patterns.
  - AGENTS.md was not touched.

## Known Issues

None. No defect was left open. The design differences below were accepted; they are not defects:
- The products table and search results leave out the mockups' Description column (SWHM2-MCK-19 and -25), because it is not in the products read contract.
- Item detail has no "Add to cart" button and the header's language switcher does nothing yet. Both belong to the Cart and Localisation capabilities (D6).
- Item detail adds a "Unit cost" row that the mockups do not draw (D5).
- The shell chrome differs from the mockups' sidebar and top bar. The shared shell from SWHM2-S-0001 is used.

## Retrospective

**Went well**
- The locked harness was read as the contract during planning. Two traps were written into
  `design.md` before any code existed:
  - the db stub in C-0010 means queries must run through `db.all`/`db.get`;
  - `cat-f` must stay one token for C-0017.
  The build then matched the locked suite without a dispute.
- One FEATURE carried the whole change. From the plan commit to the QA report took about 22
  minutes (23:26 to 23:48), and QA fixed nothing in place.
- Spec discrepancies D1–D8 were settled at planning, so the build made no product decisions of its own.

**Could improve**
- **Planning could not check the runtime.** The planning clone had no `node_modules`, so whether
  libsql enforces foreign keys was left open. The build confirmed they are on by default. Planning
  should install dependencies before Stage 0.
- **A planning instruction was quietly overridden.** P10 asked for `outputFileTracingIncludes`.
  The build skipped it as a runner config change and copied the file in the Dockerfile
  instead. The result works, but the path it chose sits under the database volume
  (SWHM2-T-0013). Planning should name the image path explicitly.
- **Design fidelity was partly checked by reading code.** QA viewed only the category-list
  screenshot pair and relied on `design-check.md` for the others. A side-by-side check of every
  mockup at both widths would make the design verdicts stronger.
