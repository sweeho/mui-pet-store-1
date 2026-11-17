# Architecture

## Stack

- **Runtime**: Node.js and npm, at the versions in `stack.versions.yaml`
- **Framework**: Next.js App Router: server-rendered pages and API route handlers in one app
- **UI**: React and MUI, with the Modernize Free admin shell in `src/shell/` and one theme built
  from `design/tokens.mui.json`
- **Database**: Drizzle ORM over SQLite (libsql, a file) or PostgreSQL (`DATABASE_URL`, or a
  throwaway local cluster in development and tests)
- **Tests**: Jest through `next/jest` (jsdom for components, node for routes and the database),
  Playwright end to end, Stryker for mutation testing
- **Packaging**: a Docker image of Next.js's standalone server, run as the non-root `node` user

## Data flow

A request for a page runs its server component, which reads through `src/lib/` and `getDb()` and
renders MUI components inside the shell. An API route (`src/app/api/**/route.ts`) does the same and
answers JSON. The browser calls the API with `withBasePath()`, so the app works under the staging
preview's path prefix (`NEXT_BASE_PATH`).

`getDb()` (`src/db/client.ts`) connects once per process, applies the migrations in `drizzle/` and
seeds two demo users when the table is empty.

## Deployment

The `Dockerfile` builds the app with `output: "standalone"` and runs `server.js` under Node as the
`node` user on a base image pinned by digest. `compose.yaml` runs it on :3000; a PostgreSQL
project's Compose file adds a `db` service. With the Helm option, `chart/` deploys the image and
its CI job lints and validates it. Vortex never builds or runs the image: CI's `docker-build` job
does.

## Key Decisions

- **One shell, one navigation.** Every page renders inside `(DashboardLayout)`'s shell; a
  capability adds a `MENU_ITEMS` entry and a page, never its own chrome or menu. Rationale: one
  product, not ten. Authored in change `swhm2-i-0001-bootstrap-landing-page-and` (design.md).
- **Primary-area routes are fixed.** `/catalog`, `/cart`, `/signon`, `/admin/inventory` and
  `/admin` exist from the first sprint as "not available yet" placeholders; the owning capability
  replaces the page at that path, never the path. Rationale: navigation, landing tiles and locked
  acceptance suites already point there. Authored in change
  `swhm2-i-0001-bootstrap-landing-page-and` (design.md, Sprint planning).
- **Shared state frames.** Empty, error and loading states come from `src/components/frames/` via
  each route's `error.tsx` / `loading.tsx`. Rationale: consistent behaviour and one retry path.
  Authored in change `swhm2-i-0001-bootstrap-landing-page-and` (design.md).
