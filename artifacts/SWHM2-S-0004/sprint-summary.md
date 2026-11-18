---
artifact: sprint-summary
sprint: SWHM2-S-0004
ticket: SWHM2-T-0021
author: planning
---

# Sprint summary — SWHM2-S-0004

**Goal:** SWHM2-I-0004: Shopping cart. **Outcome: met.** Integration QA passed all 14 scenario
verdicts across the 10 requirements of change `swhm2-i-0004-shopping-cart`. It found no defects,
and no defect was left open.

## Delivered

| Ticket | Type | What | Status |
|---|---|---|---|
| SWHM2-T-0018 | TASK | Sprint plan: one FEATURE, tagged `tasks.md`, the planning section of `design.md` (P1–P7) and spec discrepancies SD1–SD5, 4 mockups exported, ARCHITECTURE.md (`shopping_cart` entity, one Key Decision) | DONE |
| SWHM2-T-0019 | FEATURE | Pure cart model, catalog-backed listing, `shopping_cart` table with a 15-minute idle rule, `POST /api/cart`, the `/cart` screen, "Add to cart" on the item page, a sign-on-protected `/checkout` placeholder and a cart count in the navigation; all 10 `tasks.md` lines | DONE |
| SWHM2-T-0020 | TASK | Integration QA: every scenario passes, no defects | DONE |
| SWHM2-T-0021 | TASK | Sprint close: this summary and the release notes | DONE |

No follow-up tickets were raised during the sprint.

## Acceptance

| Scenario group | Verdict |
|---|---|
| Cart model: one line per item, replace on re-add, default quantity 1 | pass |
| Quantity rules: zero removes, positive sets, non-numeric counts as zero | pass |
| Remove one line, empty the cart, item count is distinct lines | pass |
| Listing: catalog data per line, US English when no locale is given, line totals and unrounded subtotal, unavailable item omitted without error | pass |
| Flow: add from the item page, then proceed to checkout | pass |

The evidence is in `qa-test-report.md`:
- `npm run verify`: 26 suites and 149 tests passed. Line coverage is 94.21%.
- Project E2E: 17 tests passed, including the 3 tests in `e2e/cart.spec.ts`.
- The locked shopping-cart acceptance suite passes in both Jest and Playwright. Cases SWHM2-C-0064
  to C-0077 are green.
- QA did not exercise each scenario by hand on a staging deploy.

Locked suites for the 7 capabilities not built yet still fail, as expected. They are judged at
release UAT.

## Changes beyond the feature

- **Shell:** `Sidebar.tsx`, `SidebarItems.tsx` and `DashboardShell.tsx` now show a count on the
  Cart entry. The layout reads the cart on the server to get it.
- **`/checkout`:** a placeholder page that requires sign-on. Checkout and payment (SWHM2-I-0005)
  replaces the page at that path.
- **Existing tests:**
  - `e2e/home.spec.ts` now uses `/admin` as its example of a placeholder page.
  - The catalog item test now expects an "Add to cart" button.
- **Root docs:**
  - ARCHITECTURE.md was updated at planning and still matches what shipped. It is unchanged at
    close.
  - DESIGN.md gained one sentence under § The shell: a navigation entry may carry a count. The
    shell pattern changed, so this belongs in the design system.
  - PRODUCT.md is unchanged, because the capability map already listed shopping-cart.
  - AGENTS.md was not touched.
  - No `## Changelog` entry was added, per the root-doc rule. The commit message carries the
    change.

## Known Issues

None open. QA recorded design differences that need a design decision, not a fix:
- **SWHM2-MCK-36 (mobile cart):** the mockup's separate line-meta rows and sticky
  Subtotal/Proceed bar are not built. The mobile confirm for Empty cart is not a bottom sheet.
- **All four mockups:** the shell header (language links, idle notice), brand mark and navigation
  styling differ from the mockups. JetBrains Mono is not loaded.
- **SWHM2-MCK-35:** the Update cart and Remove buttons use MUI's disabled style and size, not the
  mockup's.
- **Abandoned carts:** a `shopping_cart` row is only deleted when it is read after going idle.
  There is no sweep job.
- **Open points for the Business Owner (SD5 in `design.md`):**
  - Adding with a quantity of zero or less is unvalidated, as in the legacy system. The UI never
    sends a quantity on add.
  - Unavailable items are dropped from the cart without a warning, as specified.

## Retrospective

**Went well**
- One FEATURE carried the whole change. From the plan commit to the QA report took 23 minutes
  (02:03 to 02:26), and QA fixed nothing in place.
- Planning found the two existing tests the cart would break (`e2e/home.spec.ts` and the catalog
  item test) and put them in the FEATURE's ownership map. Neither one surprised the build.
- Writing the spec discrepancies (SD1–SD5) down before the build paid off. In particular, list
  price versus `CatalogItem.unitCost` and the en_US-only catalog were settled once and followed
  without rework.
- The self-review caught a pre-hydration click race on Update cart and Empty cart before merge.

**Could improve**
- **Mobile layout was left unbuilt.** The mobile mockup's line layout and sticky checkout bar
  were out of the build and are now a design residual. Planning should name each mockup's
  distinctive elements in the PLAN so they are built or explicitly deferred.
- **Shell residuals repeat for a fourth sprint.** A design decision on the shared shell would stop
  them recurring in every QA report.
- **Scenario verdicts lean on tests alone.** No scenario was hand-checked on a deployed build. A
  short smoke on the staging preview would strengthen the add-to-checkout verdict.
- **No cleanup for abandoned carts.** The batch-operations capability should own a purge, or a
  later sprint should raise one.
