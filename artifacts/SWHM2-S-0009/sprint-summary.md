---
artifact: sprint-summary
spec: 1
status: complete
author_role: planning
sprint: SWHM2-S-0009
capability brief: swhm2-s-0009-bugfix-improvement-swhm2-t
branch: vortex/sprint/swhm2-s-0009-6b270918
upstream: [artifacts/SWHM2-S-0009/SPRINT-PLAN.md, artifacts/SWHM2-S-0009/qa-test-report.md, artifacts/SWHM2-S-0009/integration-defects-resolution.md]
---

# Sprint summary — SWHM2-S-0009

**Goal:** Bugfix & Improvement — SWHM2-T-0010, SWHM2-T-0008, SWHM2-T-0009. **Outcome: partly
met.** The breadcrumb defect and the populate-endpoint guard shipped and passed integration QA on
all 9 scenarios of change `swhm2-s-0009-bugfix-improvement-swhm2-t`. SWHM2-T-0008 filed its
test amendment but was deferred unmerged. QA escalated one flaky, unrelated e2e (SWHM2-T-0047),
and the sprint was approved into close with it open.

## Tickets

| Ticket | Type | Title | Outcome |
| --- | --- | --- | --- |
| SWHM2-T-0041 | TASK | Bugfix plan — SWHM2-S-0009 | DONE: change, design D1–D3, per-ticket PLAN.md, ARCHITECTURE.md Key Decision for D3 |
| SWHM2-T-0010 | DEFECT | Shell breadcrumb duplicates page trails and links to missing /catalog/items | DONE (`5db0d57`); see `SWHM2-T-0010/fix-note.md` |
| SWHM2-T-0009 | TASK | Restrict POST /api/catalog/populate to administrators | DONE (`040db1a`); see `SWHM2-T-0009/summary.md` |
| SWHM2-T-0008 | TASK | Reconcile i18n acceptance table item_detail with catalog item_details | DEFERRED: dispute on SWHM2-C-0169 filed; branch not merged; `tasks.md` 3.1 unticked |
| SWHM2-T-0045 | TASK | Integration QA report — SWHM2-S-0009 | DONE (`bf175a5`): all scenarios pass, escalated for SWHM2-T-0047 |
| SWHM2-T-0046 | TASK | QA rework round 1 | CANCELLED |
| SWHM2-T-0048 | TASK | Sprint close bundle — SWHM2-S-0009 | DONE: this file and `release-notes.md` |

## What shipped

- **Breadcrumb (T-0010, design D1).** The shell trail is hidden on `/catalog/**`, so catalog
  pages show only their own "Catalog path" trail. A non-last crumb is a link only when its path
  is in `KNOWN_PAGE_ROUTES` or a `MENU_ITEMS` href, otherwise plain text. A unit test checks each
  listed route has a `page.tsx` on disk. `/checkout/orders/<id>` no longer links to a missing
  "Orders" page.
- **Populate guard (T-0009, design D2).** `POST /api/catalog/populate` returns 401
  `{ error: "administrator sign-in required" }` when `NODE_ENV=production` and there is no
  administrator session. Development and test stay open, so the locked catalog-browsing e2e
  passes unchanged. The empty-catalog message no longer names the endpoint.

## Divergence from plan

- SWHM2-T-0008 did its whole planned scope (the `target: "test"` dispute on SWHM2-C-0169, no code)
  but its branch never merged: it went to review three times and was then deferred. The Test
  Author's amendment of the locked i18n test is still outstanding.
- T-0009 also updated `src/components/catalog/catalog-views.test.tsx`, which was not in its
  ownership map; it asserts the reworded message.

## Verification

From `qa-test-report.md`, on the integrated sprint branch:
- `npm test`: 65 suites, 326 tests passed.
- `npm run test:e2e`: 20 passed, 1 failed (`catalog.spec.ts` browse, a flake that passed 2 of 2
  on re-run; SWHM2-T-0047).
- Production build: anonymous populate returned 401.
- Acceptance suite (warning only): 3 suites cannot run because later capabilities are not built;
  5 acceptance e2e cases fail outside this sprint's scope (C-0232, C-0234, C-0242, C-0179, C-0226).
- Scenarios "A path segment with no page is not a link" and "Other multi-level pages keep their
  shell trail" were verified by unit test only; QA's browser check was redirected on those routes.

## Known Issues

- **SWHM2-T-0047** — Flaky e2e: `catalog.spec.ts` browse test clicks the "Fish" link before
  navigation is ready; failed once in QA, not caused by this sprint.
- **SWHM2-T-0008** — Deferred: the locked i18n test still inserts into a non-existent
  `item_detail` table until the Test Author acts on the SWHM2-C-0169 amendment.

## Open points carried forward

- Design F1: the batch-operations acceptance harness writes catalog tables in its own shape and
  drops the real ones. SWHM2-I-0011 planning must reconcile it through the amendment flow.
- The internationalisation suite cannot pass until SWHM2-I-0010 builds `src/i18n/`; that planning
  must read Key Decision D3 in ARCHITECTURE.md.

## Retrospective

**Went well**
- Both code tickets were small, ran in parallel with disjoint ownership maps, and merged within
  about ten minutes of planning with no rework.
- Keeping development and test open on the populate route avoided any locked-test amendment.
- The on-disk route check makes the breadcrumb's hard-coded list safe to maintain.

**Could improve**
- A ticket whose only deliverable is an amendment dispute does not fit the branch-and-merge gate:
  T-0008 cycled through review and ended deferred. Such work should be raised as a dispute from
  planning, not as an implementation ticket.
- T-0009's ownership map missed the existing views test that asserts the message text. A plan that
  changes copy should list the tests that assert it.
- QA could not reach `/checkout/orders/<id>` or `/admin/orders` without signing in, so two
  scenarios rest on jsdom only. A plan should say how QA reaches authenticated routes.
- Both code reviews were self-reviews.

## Compliance / Control Evidence

- Spec traceability: 9 scenarios across SWHM2-R-0147 (MODIFIED) and SWHM2-R-0198 (ADDED), all
  PASS (`qa-test-report.md`); cases SWHM2-C-0245 to C-0252.
- `tasks.md`: 1.1–2.3 stamped by the platform (`d742574`, `445fab3`); 3.1 (SWHM2-T-0008) unticked.
- Root docs at close: ARCHITECTURE.md "Sample data" integration point now states the production
  guard; DESIGN.md breadcrumb pattern now states the link rule and the catalog opt-out. PRODUCT.md
  and AGENTS.md unchanged. No `## Changelog` entry added: the commit carries the change, per the
  planning role's root-doc rule.
