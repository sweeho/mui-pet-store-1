# TDD result — SWHM2-T-0007

## Notes

The platform records the red and green runs for this ticket (linked cases SWHM2-C-0001 … SWHM2-C-0020).

- Red run id: `a7e6f3ef-daa7-4fe0-ad02-ad2c657afc1e` (valid; all 20 cases failed on an assertion or the stub).
- Green run id: see the ticket comment after the green run.

## Test cases

Own tests cite each key in the title: `src/catalog/schema.test.ts` (C-0001/2/3/5/6/7/8/19), `dialect.test.ts` (C-0004), `keywords.test.ts` (C-0015), `queries.test.ts` (C-0009/10/11/12/13/16/20), `search.test.ts` (C-0014/17), `src/app/api/catalog/populate/route.test.ts` and `e2e/catalog.spec.ts` (C-0018). The locked suite in `tests/acceptance/catalog-browsing/` runs unedited.

## Red run

Recorded by the platform at commit `dcefc28` (tests, fixtures and sentinel stubs only).

## Green run

Local gate after the change: `node .vortex/check-versions.mjs && npm run verify:full` exited 0 (lint, format, typecheck, Jest, Playwright). `npm run test:acceptance` passed 21 of 21; the locked catalog e2e (SWHM2-C-0018) passed in `npm run test:acceptance:e2e`.
