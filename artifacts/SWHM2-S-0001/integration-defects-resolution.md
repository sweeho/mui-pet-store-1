---
artifact: integration-defects-resolution
sprint: SWHM2-S-0001
ticket: SWHM2-T-0004
author: validation
---

# Integration defects resolution

## D1 — build and typecheck fail on locked acceptance tests

- Scenario: none covers it. SPEC-GAP: build must succeed with other capabilities' acceptance tests present — no scenario covers this behaviour
- Failure: `npm run build` exit 1, "Failed to type check", 73 `error TS` lines, all under `tests/acceptance/` (e.g. `Cannot find module '@/cart/cart'`). `npm run typecheck` same.
- Round 1: added `tests/acceptance` to `tsconfig.json` `exclude`. Jest and Playwright still run those tests via their own configs. Result: `npm run typecheck` exit 0, `npm run build` exit 0, `npm test` 14 passed, e2e 6 passed.
- Status: FIXED-IN-PLACE.

| Defect | Status | Rounds | Ticket |
|---|---|---|---|
| D1 | FIXED | 1 | n/a |

INTEGRATION_DEFECTS_RESOLUTION: COMPLETE
