# PLAN — SWHM2-T-0015 Customer accounts and sign-on

Change: `swhm2-i-0003-customer-accounts-and-sign`. Read its `design.md` FIRST, in particular the
"Sprint planning — SWHM2-S-0003" section (P1–P11, D1–D8). Requirements: all 23 in
`specs/customer-accounts/spec.md` (SWHM2-R-0002 … -0005, -0010, -0029, -0064 … -0071, -0126,
-0159 … -0166).

## Objective

Let shoppers create an account, sign on and stay signed on for up to 15 idle minutes, with
protected pages that send them to sign on first and back again afterwards. The work covers the
customer data model and the four approved screens plus `/account`, which is all 16 `tasks.md`
lines.

## Steps

1. Data model (1.1–1.5): design.md P1–P3. Add `sign_on`, `address`, `credit_card`, `contact`,
   `account`, `profile`, `customer` and `web_session` to `src/db/schema.ts` and generate the
   migration. Write `src/checkout/store.ts` (only `storeAddress`, `storeCreditCard`) and
   `src/accounts/store.ts`.
2. Account creation (2.1–2.4): P4, P5, P10. Write `profile.ts`, `customers.ts`,
   `registration.ts` and `POST /api/accounts/users`.
3. Sign-on and session (3.1–3.7): P6–P9, P11. Write `signon.ts`, `session.ts`,
   `web-session.ts`, `POST /api/accounts/signon` and `POST /api/accounts/signoff`. Build the
   pages `/signon` (replacing the placeholder), `/signon/error`, `/accounts/create`,
   `/accounts/create-error` and `/account`. Wire the session into the layout, header and footer.
4. Test harness: design.md §Phases 4. Then run the locked suite unedited.
5. CI: no change (design.md §Phases 5).

## Fixed interface contracts

These are fixed by the locked harness (`tests/acceptance/customer-accounts/harness.ts`, header
comment) and shared with later capabilities. Do not change them.

- Tables and columns are exactly as the harness header states. `address` and `credit_card` are
  exactly as `tests/acceptance/checkout-and-payment/harness.ts` states.
- `src/checkout/store.ts`: `storeAddress(db, addr) → addressId` and
  `storeCreditCard(db, card) → cardId`.
- `src/accounts/store.ts`, `signon.ts`, `profile.ts`, `customers.ts`, `registration.ts` and
  `session.ts` export the functions and shapes the harness header lists, with the same names,
  argument order and return shapes.
- Cookie `remember_user`: the value is the user name with `Max-Age=2678400`, and it is expired
  with `Max-Age=0`.
- Routes:
  - `/account` is protected and shows the user name.
  - An anonymous request is redirected to `/signon?returnTo=<encoded path>`.
  - The form has labels "User name" and "Password" and a "Sign on" button.
  - A failed sign-on lands on `/signon/error`.
  - `POST /api/accounts/users {userId,password}` answers 201, or a 3xx whose `Location` ends
    `/accounts/create-error`.
- `requireSignOn(path)` in `src/accounts/web-session.ts` is the one way a page is protected.
  Checkout reuses it.

## File / module ownership

- `src/db/schema.ts` (add tables), new `drizzle/0002_*.sql` + `drizzle/meta/*`
- New `src/accounts/`: `store.ts`, `signon.ts`, `profile.ts`, `customers.ts`, `registration.ts`,
  `session.ts`, `web-session.ts`, each with a `*.test.ts`
- New `src/checkout/store.ts` + `store.test.ts` (only the two functions)
- New `src/app/api/accounts/users/route.ts`, `signon/route.ts`, `signoff/route.ts`, each with a
  `route.test.ts`
- `src/app/(DashboardLayout)/signon/page.tsx` (replace placeholder), plus new
  `signon/error/page.tsx`, `accounts/create/page.tsx`, `accounts/create-error/page.tsx` and
  `account/page.tsx`
- New `src/components/accounts/*` views + `*.test.tsx`
- `src/app/(DashboardLayout)/layout.tsx`, `src/shell/DashboardShell.tsx`, `src/shell/Header.tsx`
  and `src/shell/Footer.tsx` (session prop, signed-on state, footer note), plus their existing
  tests
- New `e2e/accounts.spec.ts`
- Not owned:
  - `tests/acceptance/**` (locked)
  - `openspec/**` (the platform ticks `tasks.md`)
  - `src/shell/menu.ts` (unchanged, D6)
  - `src/catalog/**` (read `listCategories` only)
  - `src/components/frames/**` (reuse only)
  - `.github/workflows/ci.yml`

## Design reference

The approved mockups are in `artifacts/SWHM2-S-0003/design/`. `MANIFEST.md` there lists them.

| Mockup files | Route and state | Viewports |
| --- | --- | --- |
| `mockup-sign-on[-mobile].html` | `/signon?returnTo=%2Faccount`, signed out | 1440 / 390 |
| `mockup-sign-on-error[-mobile].html` | `/signon/error`, after a wrong password | 1440 / 390 |
| `mockup-create-account[-mobile].html` | `/accounts/create` | 1440 / 390 |
| `mockup-user-creation-error[-mobile].html` | `/accounts/create-error`, after a duplicate user ID | 1440 / 390 |

`/account` has no mockup. Build it from `PageHeading` and an outlined `Card` (P11). The header
language toggle stays inert (D4). Colours come from theme tokens only.

## Definition of Done

- AC-1 … AC-46 on the ticket are met, one per scenario.
- The locked cases SWHM2-C-0098 … SWHM2-C-0143 pass unedited.
- The app builds, and its own unit and e2e suites stay green.
