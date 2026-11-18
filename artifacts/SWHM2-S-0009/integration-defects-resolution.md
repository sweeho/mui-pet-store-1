---
artifact: integration-defects-resolution
spec: 1
status: escalated
author_role: validation
sprint: SWHM2-S-0009
ticket: SWHM2-T-0045
capability brief: swhm2-s-0009-bugfix-improvement-swhm2-t
branch: vortex/sprint/swhm2-s-0009-6b270918
upstream: [artifacts/SWHM2-S-0009/SPRINT-PLAN.md]
downstream: [artifacts/SWHM2-S-0009/qa-test-report.md]
---

# Integration defects & resolutions — SWHM2-S-0009

## DEFECT-1: Flaky catalog browse e2e (catalog.spec.ts:4)
- **Severity:** minor
- **Detected by:** E2E
- **Symptom:** `npm run test:e2e -- --project=chromium`: `[SWHM2-C-0018] browse from categories to an item, then search` timed out waiting for `/catalog/categories/` after clicking "Fish"; URL stayed `/catalog`. Passed 2 of 2 when the spec was run alone.
- **Root cause:** Not established. Passes and fails on identical code, so it is a race (likely a click before hydration on a cold dev server). The breadcrumb and populate changes in this sprint do not touch that link.
- **Fix rounds:** none attempted; a pass/fail disagreement across runs cannot be settled by more runs.
- **Resolution:** UNFIXABLE → DEFECT ticket SWHM2-T-0047 (future sprint)
- **Validation evidence:** `npx playwright test e2e/catalog.spec.ts --project=chromium` twice: `1 passed (13.9s)`, `1 passed (8.3s)`.

## Summary
| Defect | Severity | Resolution |
| --- | --- | --- |
| DEFECT-1 | minor | SWHM2-T-0047 |

INTEGRATION_DEFECTS_RESOLUTION: ESCALATED
