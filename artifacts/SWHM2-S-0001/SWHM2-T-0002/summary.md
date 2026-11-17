# Summary — SWHM2-T-0002

Turned the template's Hello-world app into the Pet Store front door: landing page with one tile per primary area, one grouped global navigation, header (inert language control, Sign on, Create account) and footer around every page, and shared empty / error / loading frames.

## What changed
- `src/shell/menu.ts` holds grouped `MENU_ITEMS` (re-exported from `SidebarItems.tsx`) so nav and landing tiles read one list; hrefs `/`, `/catalog`, `/cart`, `/signon`, `/admin/inventory`, `/admin`.
- Shell: sidebar 240px and rendered by breakpoint in CSS (navigation is in the server HTML), `Footer`, `Breadcrumbs` (pages 2+ levels deep), header controls.
- Frames in `src/components/frames/` (`EmptyFrame`, `ErrorFrame`, `LoadingFrame`, `PageHeading`, `PlaceholderPage`); `(DashboardLayout)/error.tsx` and `loading.tsx`.
- `HomePage` keeps its `findUser(1)` load and renders `LandingView` (null → empty frame). `HomeView` removed. Placeholder pages at the five non-home routes.
- `APP_NAME` is "Pet Store". E2E `home.spec.ts` / `smoke.spec.ts` updated.

## AC coverage
AC-1 landing tiles (C-0225), AC-2 nav on every page (C-0226), AC-3 shell (C-0227), AC-4 empty frame (C-0228), AC-5 error frame + Retry (C-0229): unit tests in `LandingView.test.tsx`, `DashboardShell.test.tsx`, `frames.test.tsx`, `(DashboardLayout)/page.test.tsx`, plus the locked `tests/acceptance/site-shell` suite (3 e2e pass).

## Deviations
- Sidebar uses CSS breakpoints instead of `useMediaQuery`: the locked e2e reads the nav before hydration and found none.
- `LandingView` and `PlaceholderPage` are client components (they pass `component={Link}` to MUI).
- Mockup colours/font replaced by theme tokens; see `design-check.md`.

## Verification
`npm test` 8 suites / 14 tests pass; `npm run lint` 0 errors; `npm run test:e2e` 6 passed; `npx playwright test --config playwright.acceptance.config.ts tests/acceptance/site-shell` 3 passed. `npm run typecheck` shows only the 73 pre-existing errors in other capabilities' locked `tests/acceptance/**` (none in `src/`). `format:check` flags 4 files I did not touch (api/openapi.yaml, build/manifest.yaml, design/prd/PRD.md, a locked acceptance spec).

CODE-REVIEW: self-review — sub-agent not run; reviewed own diff for hydration/server-client boundaries (fixed two: `<li>` inside `<nav>`, function props from a server component) and minimal blast radius; none rejected.
