---
artifact: sprint-summary
sprint: SWHM2-S-0001
ticket: SWHM2-T-0005
author: planning
---

# Sprint summary — SWHM2-S-0001

**Goal:** SWHM2-I-0001: Bootstrap, landing page and shared site shell. **Outcome: met.** Integration QA passed all five scenarios, and no defect is left open.

## Delivered

| Ticket | Type | What | Status |
|---|---|---|---|
| SWHM2-T-0001 | TASK | Sprint plan: one FEATURE, tagged `tasks.md`, exported mockups, DESIGN.md and ARCHITECTURE.md (Key Decisions) | DONE |
| SWHM2-T-0002 | FEATURE | Landing page, grouped global navigation, header, footer, breadcrumbs, shared empty/error/loading frames, placeholder pages for the five later areas | DONE |
| SWHM2-T-0003 | chore | Leave the locked acceptance suite out of typecheck, lint and format; leave Spec Intake files out of format | landed on the branch |
| SWHM2-T-0004 | TASK | Integration QA: 5/5 scenarios pass, 2 build defects fixed in place | DONE |

## Acceptance

| Scenario | Case | Verdict |
|---|---|---|
| Landing page — A user opens the root route | SWHM2-C-0225 (e2e) | pass |
| Global navigation — Navigation is present on every page | SWHM2-C-0226 (e2e) | pass |
| Shared page layout — A page renders inside the shell | SWHM2-C-0227 (e2e) | pass |
| Shared state frames — A page has nothing to show | SWHM2-C-0228 (unit) | pass |
| Shared state frames — A page fails to load | SWHM2-C-0229 (unit) | pass |

The evidence comes from `qa-test-report.md`:
- Unit suite: 8 suites and 14 tests passed, with 87.9% line coverage.
- E2E: 6 tests passed.
- Locked site-shell acceptance suite: 2 jest tests and 3 Playwright tests passed.

## Changes beyond the feature

- **Build gate:** `tsconfig.json` excludes `tests/acceptance`; ESLint and Prettier ignore it, and Prettier also ignores `api/`, `build/` and `design/prd/`. Before this, `build` and `typecheck` failed on 73 errors in later capabilities' locked tests (QA D1), and CI was red on lint and format (QA D2).
- **Root docs:**
  - DESIGN.md: new layout grid, shell, and shared-frames sections. At close, its navigation reference was corrected to `src/shell/menu.ts`.
  - ARCHITECTURE.md: added Key Decisions (one shell, fixed routes for the primary areas, shared frames).
  - PRODUCT.md: unchanged, because the capability map already lists site-shell.
  - AGENTS.md: unchanged. Corrections are recorded in `.vortex/agents-generated.md`.

## Known Issues

None. No defect was left open. The residual items below are accepted design differences, not defects:
- The brand has no paw-mark icon (SWHM2-MCK-9).
- Colours and font come from the theme tokens rather than the mockup's indigo and Inter.
- The error frame was checked at component level, not in a browser.

## Retrospective

**Went well**
- One FEATURE carried the whole change. Planning, build, QA and close took four tickets in about 30 minutes.
- Pinning the routes that later capabilities' locked suites already use (`/catalog`, `/cart`, `/signon`, `/admin/inventory`, `/admin`) let the navigation and the e2e tests agree on the first run.
- Spec discrepancies D1–D4 were found at planning time. D2 (the landing page keeps its `findUser` load because the locked tests need it) meant the build matched the locked tests without a dispute.

**Could improve**
- **Planning missed a broken build gate.** The template's build and typecheck already failed on other capabilities' locked tests, and planning did not run the gate during Stage 0. QA found the problem, and T-0003 fixed it in parallel, which caused a merge conflict in `eslint.config.mjs` and `.prettierignore`. Running the build gate during Stage 0 would have caught this before execution.
- **An SSR detail cost a build iteration.** The locked e2e reads the navigation before hydration, so the sidebar had to switch from `useMediaQuery` to CSS breakpoints. Future shell work should keep the navigation in the server-rendered HTML.
- **Acceptance CI steps still don't fail the job.** They remain `continue-on-error` until the later capabilities' suites are green.
