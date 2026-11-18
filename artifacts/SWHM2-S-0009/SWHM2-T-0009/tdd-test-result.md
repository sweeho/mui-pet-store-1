# TDD result — SWHM2-T-0009

## Notes

- Red run: eccd7c3c-01db-4fb2-8ef1-ed86e18d6137 (C-0245, C-0248 failed on assertions; C-0246, C-0247 already passed as regression guards).
- Green run: d8a56108-17a9-4cd0-ba4f-146848dd6213 (all four cases pass).
- Full gate `node .vortex/check-versions.mjs && npm run verify:full`: exit 0, 21 e2e passed.
