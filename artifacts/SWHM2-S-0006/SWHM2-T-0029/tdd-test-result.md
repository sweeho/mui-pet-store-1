---
artifact: tdd-test-result
ticket: SWHM2-T-0029
---
# TDD result — SWHM2-T-0029 Order approval

## Test cases

Cases SWHM2-C-0021 to SWHM2-C-0036, each with a test whose title carries its key:

| Cases | Test file |
|---|---|
| C-0021 | `src/approval/orders.test.ts` |
| C-0022 | `src/approval/decision.test.ts` |
| C-0023, C-0024, C-0030, C-0035 | `src/approval/receive.test.ts` |
| C-0025, C-0026, C-0031, C-0032, C-0036 | `src/approval/handler.test.ts` |
| C-0033, C-0034 | `src/approval/policy.test.ts` |
| C-0027, C-0028, C-0029 | `src/components/admin/OrderApprovalView.test.tsx` (plus `e2e/approval.spec.ts` for the flow) |

## Red run

Platform run `baa5adf0-335e-4e69-8ce7-428beb134244` at commit `62ea598`: valid. Cases C-0021 to C-0026, C-0030 to C-0032, C-0035 and C-0036 failed on an assertion; C-0027 to C-0029, C-0033 and C-0034 failed on the stub.

## Green run

Platform run `3e2cb790-4c01-4775-8dd4-6dfd3d4549b8`: valid, all 16 cases pass. The acceptance block reported the unit suite as unjudged (no JUnit report in the container). Run locally: `npx jest -c jest.acceptance.config.mjs tests/acceptance/order-approval` gave 13 passed, 0 failed; the order-approval browser specs passed in `npm run test:acceptance:e2e`.

## Notes

- Two test files changed after red, without weakening them: `OrderApprovalView.test.tsx` (the fetch mock returns a plain object, because jsdom has no `Response`) and `src/app/api/checkout/orders/route.test.ts` (two new tests for the hand-off).
- Full gate after the last code change: `node .vortex/check-versions.mjs && npm run verify:full` exit 0 (see summary.md).
