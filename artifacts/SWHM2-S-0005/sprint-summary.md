---
artifact: sprint-summary
sprint: SWHM2-S-0005
ticket: SWHM2-T-0027
author: planning
---

# Sprint summary — SWHM2-S-0005

**Goal:** SWHM2-I-0005: Checkout and payment details. **Outcome: met.** Integration QA gave a pass
verdict on all 27 scenarios of change `swhm2-i-0005-checkout-and-payment-detail`. It found no
defects, and no defect was left open.

## Delivered

| Ticket | Type | What | Status |
|---|---|---|---|
| SWHM2-T-0022 | TASK | Sprint plan: one FEATURE, tagged `tasks.md`, the planning section of `design.md` (P1–P10) and spec discrepancies SD1–SD6, 6 mockups exported, ARCHITECTURE.md (orders data model, three Key Decisions) | DONE |
| SWHM2-T-0023 | FEATURE | Two-step `/checkout` (shipping and contact, then billing and payment), `POST /api/checkout/orders`, `GET /api/checkout/orders/{id}`, the order confirmation page, sequence-based order ids, the placeholder card, the XML documents, and migration `drizzle/0004_*`; every `tasks.md` line | DONE |
| SWHM2-T-0025 | TASK | Integration QA: every scenario passes, no defects | DONE |
| SWHM2-T-0027 | TASK | Sprint close: this summary and the release notes | DONE |

One follow-up was raised during planning: **SWHM2-T-0024** (improvement, BACKLOG). It asks for a
decision on whether the order API should require sign-on (SD2).

## Acceptance

| Scenario group | Verdict |
|---|---|
| Order record: id, user, e-mail, date, locale, total, contact, card, at least one line | pass |
| Placeholder card (1234-2334, Duke Express, 10/2001) on every order | pass |
| Card expiry: "month/year" text, missing or slash-less reads 01/2010 | pass |
| Card attributes, creation, storage, removal in one transaction, operation access | pass |
| Address storage: unique id, street line 2 optional; contact created with an empty address | pass |
| No validation of contact name, phone and e-mail | pass |
| Documents: purchase order, contact, address and card, with wrong roots rejected | pass |
| Identifiers: issued in sequence; a new sequence's first id ends in 1 | pass |

The evidence is in `qa-test-report.md`:
- `npm test`: 35 suites and 191 tests passed. Line coverage is 94.87%.
- Project E2E: 18 tests passed, including `e2e/checkout.spec.ts`.
- The locked checkout-and-payment acceptance suite passes in Jest (26 tests). Playwright case
  SWHM2-C-0054 passes. Cases SWHM2-C-0037 to C-0063 are green.
- Locked suites for the 6 capabilities not built yet still fail, as expected. They are judged at
  release UAT.

## Changes beyond the feature

- **Acceptance test runner:** `src/db/acceptance-setup.ts` gives each acceptance Jest file its own
  copy of the database. Before this, the locked checkout and customer-accounts suites reset the
  same tables and failed about 2 runs in 3.
- **`/checkout`:** the sign-on-protected placeholder from SWHM2-S-0004 is replaced by the real
  page.
- **Root docs:** none changed at close.
  - ARCHITECTURE.md was updated at planning (orders data model, three Key Decisions). It still
    matches what shipped.
  - PRODUCT.md already listed checkout-and-payment in its capability map.
  - DESIGN.md: the design system did not change. No token changed.
  - AGENTS.md was not touched.

## Known Issues

None open. These points were recorded and need a decision, not a fix:
- **No "Checkout" entry in the left navigation.** The brief places checkout there. The entry made
  the locked case SWHM2-C-0226 fail 4 runs in 6, because `/checkout` redirects on the client.
  The way in is the cart's "Proceed to checkout". A server-side redirect for protected pages
  would let the entry return.
- **SWHM2-T-0024 / SD2:** the order API accepts an anonymous caller as user `"anonymous"`, because
  locked case C-0054 submits with no session. The pages stay protected.
- **SD3:** the entered card is stored in `payment_card` but never used as the order's card.
- **SD6:** card numbers are stored in clear text, as in the legacy store. This is a PCI point for
  the Business Owner.
- **Writes are not one transaction:** a failure between the card, the id and the order writes can
  leave an orphan card row or a skipped id. This matches the legacy store.
- **Design fidelity (SWHM2-MCK-39 to MCK-44):** the pages differ from the mockups by 8–16% of
  pixels:
  - the app's shell is used instead of the mockups' own shell
  - fields use MUI outlined labels
  - item thumbnails are missing
  - JetBrains Mono is not loaded
  - the confirmation status reads "Submitted — awaiting approval" (SD4)
  - the mobile confirmation lists items in a table instead of cards

## Retrospective

**Went well**
- One FEATURE carried the whole change. It took 26 minutes from the plan commit to the QA report
  (03:03 to 03:29), and QA fixed nothing in place.
- Planning wrote SD1–SD6 down before the build. The contact element order, anonymous submission
  and the confirmation status were each settled once and followed without rework.
- The implementer found a flaky shared database across locked suites and fixed it in the runner
  (P10), not in the locked tests. The fix is now a Key Decision.
- The self-review caught a 500 on a JSON body with the wrong content type and a duplicate-id
  total bug before merge.

**Could improve**
- **A planned navigation entry was dropped during the build.** The client-side sign-on redirect
  conflicts with the locked navigation case. Planning should check protected routes against
  SWHM2-C-0226 before it plans a navigation entry.
- **Shell residuals repeat for a fifth sprint.** A design decision on the shared shell, or mockups
  drawn inside the app's shell, would stop them recurring in every QA report.
- **The mobile confirmation is 500px taller than its mockup.** As in SWHM2-S-0004, a mobile
  layout element (the item cards) was not built. PLAN.md should name each mockup's distinctive
  mobile elements.
- **Security decisions are waiting:** SD2 (anonymous order API) and SD6 (clear-text cards) need
  the Business Owner before release.
