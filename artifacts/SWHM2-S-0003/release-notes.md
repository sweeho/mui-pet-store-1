---
artifact: release-notes
sprint: SWHM2-S-0003
ticket: SWHM2-T-0017
author: planning
---

# Release notes — SWHM2-S-0003

## Shoppers can create an account and sign on

**Account & sign-on** is now a working area. Checkout, built next, will use it to know who the
customer is.

### New

- **Create an account** (`/accounts/create`): pick a user name and password and set your
  preferences.
  - A user name is at most 25 characters and cannot contain `%` or `*`.
  - A new account starts active, with English (US), no favourite category, and the personal list
    and banners turned on.
  - A taken user name or any other failure opens the user-creation error page
    (`/accounts/create-error`).
- **Sign on** (`/signon`): the user name and password must match exactly, including case. A wrong
  password or unknown user name opens the sign-on error page (`/signon/error`). A successful
  sign-on returns you to the page you were trying to reach.
- **Protected pages ask for sign-on first.** Your account page (`/account`) is the first; checkout
  will be next. After signing on you land on the page you asked for.
- **Remember my user name** keeps your user name on this browser for 31 days. Unticking it forgets
  any remembered name.
- **Your language follows you.** At sign-on, the storefront and cart switch to your profile's
  language. Without a saved profile, the current language stays.
- **Sessions end after 15 minutes idle.** The next request is treated as signed out.
- **Sign off** from the header. The header shows when you are signed on.

### Changed

- **New look across the app.** The colours and type now follow the approved mockups: an indigo
  primary colour, slate text and the Inter typeface.

### Not available yet

- The language switcher in the header is not built; it arrives with Localisation.
- Checkout, the first protected page that places an order, arrives with Checkout and payment.

### For developers

- Account modules are in `src/accounts/`; screens are under `src/app/(DashboardLayout)/` (`signon`,
  `accounts`, `account`) and `src/components/accounts/`.
- API routes: `POST /api/accounts/users`, `POST /api/accounts/signon`, `POST /api/accounts/signoff`.
- Protect a page with `requireSignOn(path)` from `src/accounts/web-session.ts`. `returnTo` must be
  a same-site path.
- Sessions are database rows (`web_session`) keyed by a cookie holding the session id.
- New migration: `drizzle/0002_daily_donald_blake.sql` adds `sign_on`, `address`, `credit_card`,
  `contact`, `account`, `profile`, `customer` and `web_session`.
- New dependency: `@fontsource-variable/inter@5.3.0`.
- Tests that write to the database can call `useIsolatedDatabase` (`src/db/isolated.ts`) to get
  their own SQLite file.
- Passwords are stored as supplied, as the approved specification (SWHM2-R-0161) requires.

### Known issues

None open. Some screens differ from the mockups in shell chrome, copy and button sizes; see
`qa-test-report.md` § Design fidelity.

The evidence comes from `qa-test-report.md`:
- Unit suite: 21 suites and 112 tests passed.
- E2E: 14 tests passed.
- The locked customer-accounts acceptance tests pass.
