---
ticket: SWHM2-T-0015
type: FEATURE
---
# TDD result

## Test cases

All 46 linked cases (SWHM2-C-0098 … SWHM2-C-0143) have a test of the ticket's own with the case key in its title:
`src/accounts/accounts.test.ts` (41 unit/integration cases, node environment) and `e2e/accounts.spec.ts` (5 browser
cases: C-0134, C-0135, C-0136, C-0137, C-0140). Extra tests that carry no case key: `src/accounts/web-session.test.ts`,
`src/app/api/accounts/routes.test.ts`, `src/components/accounts/accounts-views.test.tsx`,
`src/shell/DashboardShell.test.tsx` (session state), `e2e/accounts-flow.spec.ts`.

## Red run

Platform run `2bbf3d3d-6f7e-4c77-a871-993d9cdc124d` at `7c3e410` `[tdd:red]`: valid. Every case failed, 37 on the stub
and 9 on an assertion (C-0105, C-0107, C-0125, C-0129, C-0134, C-0135, C-0136, C-0137, C-0140 on the missing pages and
tables). An earlier red run was refused because `types.ts` and a test helper were not stubs; the types moved into the stub
`store.ts` and the helper into the test file.

## Green run

Platform run `3ab67d54-b5cb-48c9-aa01-1daba26861d0` at `5973597` `[tdd:green]`: valid, all 46 cases pass. The locked
browser cases C-0134 … C-0137 and C-0140 pass in the acceptance run; the locked unit suite was "unjudged" there because the
platform's run wrote no JUnit report (the reply says this is not a test failure). I ran it myself
(`npm run test:acceptance`): `tests/acceptance/customer-accounts` passes; the other capabilities' suites fail to load
because their modules do not exist yet (same on a clean tree).

Local gate after the last commit: `check-versions`, `npm run lint`, `format:check`, `typecheck`, `npm test` (21 suites,
all pass) and `npm run test:e2e` (14 passed).

## Notes

- `src/shell/DashboardShell.test.tsx` is reported as modified after red: two session-state tests were added to the
  existing file; no existing test changed.
