---
artifact: integration-test-result
sprint: SWHM2-S-0001
ticket: SWHM2-T-0004
author: validation
---

# Integration test result

Command: `npm run test:e2e -- --project=chromium` (Playwright, project chromium, the only project)

Summary line: `6 passed (6.2s)`

| Spec | Test | Result |
|---|---|---|
| e2e/home.spec.ts | shows the welcome title and a tile for every primary area | pass |
| e2e/home.spec.ts | a placeholder area shows the shared empty frame inside the shell | pass |
| e2e/home.spec.ts | opens the navigation from the menu button on a small screen | pass |
| e2e/smoke.spec.ts | home page loads with no console errors | pass |
| e2e/smoke.spec.ts | the API responds | pass |
| e2e/smoke.spec.ts | a database-backed route responds | pass |

No skipped tests; every spec file ran. Locked acceptance e2e (`site-shell`) also ran: 3 passed.

E2E-RESULT: chromium 6 passed, 0 failed, 0 skipped
