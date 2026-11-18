---
artifact: integration-defects-resolution
spec: 1
status: complete
author_role: validation
sprint: SWHM2-S-0007
capability brief: SWHM2-I-0007
branch: vortex/sprint/swhm2-s-0007-271cdb8d
upstream: [artifacts/SWHM2-S-0007/qa-test-report.md]
---

# Integration defects resolution — SWHM2-S-0007

One defect found (D1), fixed in place in round 1. The locked acceptance failures are listed as warnings in `qa-test-report.md` and are triaged at UAT, so none was fixed here.

| Defect | Scenario | Rounds | Resolution | Ticket |
| --- | --- | --- | --- | --- |
| D1 flaky `e2e/approval.spec.ts` (approve click lost before hydration) | none (test race, no scenario) | 1 | fixed in place | none |

## D1: approval E2E flaked

Official CI handoff run (build-and-test) was red. Locally, the full `npm run test:e2e` passed once (21/21), then failed once (`getByText('1 unsent change')` not found, 1 failed / 20 passed), and the spec alone passed twice. Mixed outcomes make it a flake; the click on "Approved" can land before hydration under a loaded dev server. Fix (round 1): wrap click plus assertion in `expect(...).toPass()` in `e2e/approval.spec.ts`. Re-run: three full `npm run test:e2e` runs, each `21 passed`.

INTEGRATION_DEFECTS_RESOLUTION: COMPLETE
