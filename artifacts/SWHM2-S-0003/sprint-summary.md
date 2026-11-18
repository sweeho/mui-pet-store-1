---
artifact: sprint-summary
sprint: SWHM2-S-0003
ticket: SWHM2-T-0017
author: planning
---

# Sprint summary — SWHM2-S-0003

**Goal:** SWHM2-I-0003: Customer accounts and sign-on. **Outcome: met.** Integration QA passed
all 46 scenario verdicts (23 requirements, primary and alternative case each), found no defects,
and left no defect open.

## Delivered

| Ticket | Type | What | Status |
|---|---|---|---|
| SWHM2-T-0014 | TASK | Sprint plan: one FEATURE, tagged `tasks.md`, the planning section of `design.md` (P1–P11, D1–D8), 8 mockups exported, ARCHITECTURE.md (customer and web-session data model, two Key Decisions) and DESIGN.md (header signed-on state, footer notices, forms and outcome pages) | DONE |
| SWHM2-T-0015 | FEATURE | Eight customer tables, registration, sign-on with the remember-name cookie, language at sign-on, the 15-minute idle rule, `requireSignOn` page protection, three account API routes and five screens; all 16 `tasks.md` lines | DONE |
| SWHM2-T-0016 | TASK | Integration QA: every scenario passes, no defects | DONE |
| SWHM2-T-0017 | TASK | Sprint close: this summary and the release notes | DONE |

No follow-up tickets were raised during the sprint.

## Acceptance

| Scenario group | Verdict |
|---|---|
| Storage: contact, account, sign-on credential, profile, customer references, required contact and address fields | pass |
| Customer model: account contents, account statuses, customer identifier, customer/account/contact chain, creation attaches account and profile | pass |
| Profile: attributes, preference recording, default preferences | pass |
| Registration: new user validation, failed user creation | pass |
| Sign-on: authentication, outcome, plain-text passwords, remember user name cookie, language applied at sign-on | pass |
| Sessions: protected page interception, inactive session timeout | pass |

The evidence is in `qa-test-report.md`:
- Unit suite: 21 suites and 112 tests passed; 94.25% line coverage.
- Project E2E: 14 tests passed.
- The locked customer-accounts acceptance suite passes (Jest and Playwright). The 46 linked cases
  (SWHM2-C-0098 to C-0143) passed the platform red/green replay.
- Live curl checks on a production build covered registration, sign-on, remember-name and
  protected-page redirects. The idle timeout and language application were verified by unit tests only.

Locked suites for later capabilities still fail, as expected. They are judged at release UAT.

## Changes beyond the feature

- **Design tokens restyled the whole app.** `design/tokens.mui.json` now carries the mockups'
  indigo primary, slate text and Inter at radius 4, with Inter loaded by the new pinned dependency
  `@fontsource-variable/inter@5.3.0`. The previous theme named Plus Jakarta Sans without loading it.
- **`src/db/client.ts`:** libsql `timeout: 5000`, so parallel test workers wait for a lock instead
  of failing with `SQLITE_BUSY`.
- **`src/db/isolated.ts` (`useIsolatedDatabase`):** route, web-session and four catalog test files
  each open their own SQLite file. A shared file let parallel files see each other's rows, which
  failed the merge-gate replay once.
- **`src/checkout/store.ts`:** `storeAddress` and `storeCreditCard` live with checkout and are
  called by accounts (Key Decision, P3).
- **Root docs:**
  - ARCHITECTURE.md was updated at planning and still matches what shipped; unchanged at close.
  - DESIGN.md was updated at planning, and at close gained one line on the token palette and the
    Inter typeface being loaded, because the token change is a design-system change.
  - PRODUCT.md was unchanged: the capability map already listed customer accounts.
  - AGENTS.md was not touched.
  - No `## Changelog` entry was added, per the root-doc rule; the commit message carries the change.

## Known Issues

None. No defect was left open. QA recorded design differences that need a design decision, not a
fix; they are not defects:
- The shell (sidebar labels, logo, mobile top bar) differs from the mockups on all eight screens
  (SWHM2-MCK-27 to -34). The shared shell from SWHM2-S-0001 is used.
- The mockups' language switcher and "Signed out · Sign on" header label are not built. No
  scenario covers them (QA's SPEC-GAP); the switcher belongs to Localisation (D4).
- Copy differs slightly on several screens, and the "Show password" toggle and some mobile
  buttons are smaller than drawn (MCK-27, -28, -30, -32, -34).

## Retrospective

**Went well**
- One FEATURE carried the whole change. From the plan commit to the QA report took about 32
  minutes (00:49 to 01:21), and QA fixed nothing in place.
- The red run was strict and useful: a first attempt was refused because types and a helper were
  not stubs, and the corrected run failed every case for the right reason.
- Security review happened inside the build: the self-review closed a `/\host` open-redirect gap
  in `returnTo` before merge.

**Could improve**
- **Test isolation was found late.** The merge-gate replay failed on shared SQLite rows between
  parallel test files, and the fix reached into catalog test files outside the ticket's ownership.
  Planning should name per-file database isolation as part of the test harness when a sprint adds
  write-heavy tests.
- **Some behaviour was only unit-checked.** The idle timeout and language at sign-on were not
  exercised in a browser. A clock-controlled E2E check would make those verdicts stronger.
- **Design residuals repeat every sprint.** The shell differs from each sprint's mockups. A design
  decision on the shell (adopt the mockups' sidebar or redraw the mockups) would stop this from
  appearing in every QA report.
- **Acceptance unit suite went unjudged in the platform replay** because no JUnit report was
  written; the engineer ran it by hand. The acceptance run should emit a report.
