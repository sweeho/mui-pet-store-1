# PLAN — SWHM2-T-0002 Bootstrap, landing page and shared site shell

Change: `swhm2-i-0001-bootstrap-landing-page-and` (read its `design.md` FIRST — "Sprint planning" section). Requirements: Landing page (SWHM2-R-0194), Global navigation (SWHM2-R-0195), Shared page layout (SWHM2-R-0196), Shared state frames (SWHM2-R-0197).

## Objective

Turn the template's "Hello, world" app into the Pet Store front door: a landing page linking every primary area, one grouped global navigation, a header and footer around every page, and shared empty / error / loading frames. All nine `tasks.md` lines.

## Steps

1. Boilerplate (tasks 1.1–1.2) — design.md §Phases 1. Keep tooling untouched; `APP_NAME` → "Pet Store".
2. Shared frames (tasks 4.1–4.3) — build first, the landing page and placeholders use them. design.md §Phases 4. Add `(DashboardLayout)/error.tsx` and `loading.tsx`.
3. Site shell (tasks 3.1–3.2) — design.md §Phases 3. Grouped `MENU_ITEMS`, 240px sidebar, header controls, `<footer>`, breadcrumbs component, placeholder pages at `/catalog`, `/cart`, `/signon`, `/admin/inventory`, `/admin`.
4. Landing page (tasks 2.1–2.2) — design.md §Phases 2 and §Spec discrepancies D2. Tiles derive from `MENU_ITEMS` so tiles and navigation can never disagree.
5. Tests — design.md §Phases 5. Update template tests that asserted "Hello, world".

## Fixed interface contracts

- `src/app/(DashboardLayout)/page.tsx`: default export `async function HomePage()`, loads via `findUser` from `@/lib/users`; resolves `null` → renders `data-testid="empty-frame"`; rejects → `HomePage()` rejects.
- `src/app/(DashboardLayout)/error.tsx`: `"use client"`, default export `({ error, reset }: { error: Error; reset: () => void })`, renders `data-testid="error-frame"` and a `<button>` named "Retry" that calls `reset()`.
- `src/components/frames/`: `EmptyFrame({ title, message, action? })` → `data-testid="empty-frame"`; `ErrorFrame({ message, onRetry })` → `data-testid="error-frame"`; `LoadingFrame()` → `data-testid="loading-frame"`, `role="status"`.
- `MENU_ITEMS` (`src/shell/SidebarItems.tsx`): exported, grouped `{ group, items: { title, href, icon, description }[] }[]`; hrefs exactly `/`, `/catalog`, `/cart`, `/signon`, `/admin/inventory`, `/admin`. Later capabilities replace the placeholder page at a path, never the path.
- Landmarks: the sidebar `<nav>` is the FIRST `navigation` landmark in DOM order (breadcrumbs come after it); header is `<header>`; `<footer>` follows `<main>`.

## File / module ownership

- `src/constants/app.ts`, `src/app/layout.tsx` (title/description only)
- `src/shell/DashboardShell.tsx`, `Header.tsx`, `Sidebar.tsx`, `SidebarItems.tsx`, new `src/shell/Footer.tsx`, `src/shell/Breadcrumbs.tsx`
- `src/app/(DashboardLayout)/page.tsx`, `error.tsx`, `loading.tsx` (new)
- `src/app/(DashboardLayout)/catalog/page.tsx`, `cart/page.tsx`, `signon/page.tsx`, `admin/page.tsx`, `admin/inventory/page.tsx` (new placeholders)
- `src/components/frames/*` (new, with tests), `src/components/LandingView.tsx` + test (replaces `HomeView.tsx` + test)
- `e2e/home.spec.ts`, `e2e/smoke.spec.ts`
- Not owned: `tests/acceptance/**` (locked), `.github/workflows/ci.yml` (no change needed), `openspec/**`.

## Design reference

Approved mockups in `artifacts/SWHM2-S-0001/design/` (see `MANIFEST.md` there):
- `mockup-site-shell.html` — any page, signed out, 1440. `mockup-site-shell-mobile.html` — any page, menu folded, 390.
- `mockup-landing-page.html` — `/`, 1440. `mockup-landing-page-mobile.html` — `/`, 390.
- `mockup-empty-state.html` / `-mobile.html` — `/catalog` placeholder, empty, 1440 / 390.
- `mockup-error-state.html` / `-mobile.html` — a page whose load fails, 1440 / 390.

Colours from theme tokens only; 240px nav, 24px gutter, 24px semibold page title.

## Definition of Done

AC-1 … AC-5 on the ticket (one per scenario). Locked cases SWHM2-C-0225 … SWHM2-C-0229 pass unedited; the app builds and the template's own unit and e2e suites stay green.
