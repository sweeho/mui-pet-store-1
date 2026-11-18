# Legacy implementation notes: customer-accounts

## User interface
No screen records were extracted for this capability; its user interface is unspecified. Sign-on, user creation and error pages are referenced only through their redirect behaviour.

## How the legacy application implements it
- Sign-on: a servlet filter (SignOnFilter) matches the target URL by exact string equality against patterns in /WEB-INF/signon-config.xml (not seen), stores the original URL in the session and forwards to the sign-on page. Authentication runs in SignOnEJB.authenticate, which finds UserEJB by primary key and calls matchPassword (String.equals, plain text).
- Remember-me: cookie of 2678400 seconds (31 days); otherwise the cookie is expired.
- User creation: validation of user ID length (25), password length and '%' / '*' characters; duplicate names fail on the primary key and redirect to an error page.
- Customer creation: the customer EJB creates an account (status active) and a profile (defaults en_US, no favourite category, my-list on, banner on); empty contact info and credit card are created when none are supplied.
- Session timeout of 15 minutes comes from the web application deployment descriptor.
- Schema constraints: customer user id equals a unique sign-on user name; account references contact and credit card; contact references address. Passwords and card numbers are stored unencrypted.

## Open points
- The protected URL list is not in the analysed module (CUST-REQ-0001).
- Plain-text password storage is a suspected legacy defect; the Business Owner decides in the defect register.
- The pass files disagree on some wording; records here follow the consolidated IR statements.

## Sprint planning — SWHM2-S-0003

One FEATURE, **SWHM2-T-0015**, owns every line of `tasks.md`, in order. Plan:
`artifacts/SWHM2-S-0003/SWHM2-T-0015/PLAN.md`. Approved mockups:
`artifacts/SWHM2-S-0003/design/` (see `MANIFEST.md` there).

### Codebase findings

- No account code exists. `src/db/schema.ts` holds the template `users` table and the six catalog
  tables; `drizzle/` has two migrations (`0000_*`, `0001_*`). Foreign keys are enforced on the
  libsql connection (the catalog's FK cases pass). `getDb()` (`src/db/client.ts`) rethrows a
  store failure with the store's own message.
- `/signon` is a placeholder (`src/app/(DashboardLayout)/signon/page.tsx` renders
  `PlaceholderPage`). The menu entry Account → "Sign on" → `/signon` is in `src/shell/menu.ts`.
  `src/shell/Header.tsx` (client component) has inert "Sign on" and "Create account" buttons and an
  inert language toggle. `(DashboardLayout)/layout.tsx` renders `DashboardShell`, which renders
  `Header` with no session information.
- No cart, checkout or session code exists. `/cart` is a placeholder.
- The locked acceptance suite is already on the branch: `tests/acceptance/customer-accounts/`
  (`harness.ts` is the contract; `customer-accounts.test.ts` covers C-0098…C-0133, C-0138,
  C-0139, C-0141…C-0143; `e2e/customer-accounts.spec.ts` covers C-0134…C-0137, C-0140). It fixes
  the module paths under `src/accounts/`, the function signatures, the table and column names,
  the cookie name `remember_user`, and the routes `/account`, `/signon?returnTo=`,
  `/signon/error`, `/accounts/create-error` and `POST /api/accounts/users`.
- The locked suite imports `storeAddress` / `storeCreditCard` from `@/checkout/store`, and
  `resetData` deletes from `address` and `credit_card`. Neither exists yet. The checkout harness
  (`tests/acceptance/checkout-and-payment/harness.ts`) fixes the same two functions and tables,
  so creating them here is compatible with SWHM2-I-0005.
- The admin-order-management e2e (a later sprint) signs on through the same form and `/account`,
  so these routes and labels are shared contracts.
- The acceptance browser run (`playwright.acceptance.config.ts`, :3101) uses `next dev` on the
  default `sqlite.db`; the user-creation route must write through `getDb()`.

### Decisions

- **P1 Tables follow the harness exactly** (1.1–1.5): `sign_on(username PK, password)`,
  `address(address_id, street1, street2?, city, state, zip, country)`,
  `credit_card(card_id, card_number, card_type, expiry_date)`,
  `contact(contact_id, family_name, given_name, telephone, email, address_id → address)`,
  `account(account_id, status, contact_id → contact, card_id → credit_card)`,
  `profile(profile_id, language, favorite_category?, my_list, banner)`,
  `customer(user_id PK → sign_on.username, account_id → account, profile_id → profile)`.
  Every column is `NOT NULL` except `street2` and `favorite_category`. Integer ids
  autoincrement. CHECK constraints carry what SQLite does not: `sign_on.username` length 1–50,
  `sign_on.password` length 1–50, `account.status IN ('active','disabled')`. Booleans are
  integer 0/1, read back as booleans. One generated migration, `drizzle/0002_*`.
- **P2 Store functions reject, never half-write.** `src/accounts/store.ts` inserts through
  Drizzle; a constraint failure rejects with the store's message and leaves no row. The store
  does not pre-validate required fields: the `NOT NULL` / CHECK / FK constraints are the
  rejection (C-0099, C-0101, C-0105, C-0107, C-0129).
- **P3 Address and card storage live in `src/checkout/store.ts`** with only `storeAddress` and
  `storeCreditCard` for now. SWHM2-I-0005 extends the same file. Empty records (2.2) are
  `""` in every required text column, which the constraints allow.
- **P4 Customer creation is one transaction** (2.2, 2.3): `createCustomer` inserts sign-on,
  (empty or supplied) address/contact/card, account `active`, profile (defaults merged with
  any supplied preferences: `en_US`, `null`, `true`, `true`) and customer inside
  `db.transaction`, and calls `beforeCommit` last; a throw rolls everything back.
- **P5 Registration** (2.1, 2.4): `registerUser` rejects a user ID over 25 characters, one
  containing `%` or `*`, an empty user ID, or a password over 50 characters, before touching the
  database. A duplicate or any thrown error returns `{ ok: false, redirect:
  "/accounts/create-error" }`. Success creates the customer with the submitted preferences
  (via `recordProfile`, 3.7).
- **P6 Session model** (3.2–3.6). The pure functions in `src/accounts/session.ts` work on plain
  objects, as the harness requires. In the app, the session is a row in a new
  `web_session(session_id PK, username?, signed_on, language, cart_language, last_access)` table.
  Its id is a random UUID in an `httpOnly`, `SameSite=Lax`, `Path=/` cookie (`pet_session`,
  browser-session lifetime). `src/accounts/web-session.ts` loads the row, runs `touchSession`
  with the current time, and writes the result back (or deletes the row when it has expired).
  Reason: a server component cannot set cookies, but it can update a row, so every page can
  apply the 15-minute idle rule. A signed cookie would need a secret the project does not have.
- **P7 Protected pages** (3.1). A server helper `requireSignOn(path)` in
  `src/accounts/web-session.ts` returns the signed-on session or calls `redirect` to
  `/signon?returnTo=<encoded path>`. Protected pages call it first. In this sprint the only
  protected page is `/account`. Checkout calls the same helper later. There is no `proxy.ts`.
  The page owns the decision, and the URL list stays in code next to the page (see D1).
- **P8 Sign-on flow** (3.3, 3.4). The `/signon` form is a plain HTML `POST` to
  `/api/accounts/signon` (fields `username`, `password`, `remember`, hidden `returnTo`), so it
  works without client JS. The route calls `signOn`, upserts the web session, sets the session
  cookie and the `setCookies` from `signOn`, and answers `303`. On success it redirects to
  `returnTo` when that is a same-site path (starts with `/`, not `//`), else `/`. On failure it
  redirects to `/signon/error?returnTo=…`. Every redirect carries the base path. The sign-on page
  pre-fills the user name from the `remember_user` cookie. `remember_user` is
  `Path=/; Max-Age=2678400; SameSite=Lax`, and expiring it uses `Max-Age=0`. It is only emitted
  for an unticked box when the cookie exists.
- **P9 Language at sign-on** (3.5). `signOn` sets `session.language` and `cart.language` from the
  customer's profile. A sign-on user with no customer row keeps the session language. An anonymous
  visitor's language is `en_US` until SWHM2-I-0010 adds switching. The web session stores both
  languages so shopping-cart (SWHM2-I-0004) and localisation (SWHM2-I-0010) can read them.
  Rendering the storefront in that language is out of scope (D4).
- **P10 User creation route.** `POST /api/accounts/users` accepts JSON `{ userId, password }` or
  the create-account form (form-encoded, with `language`, `favoriteCategory`, `myList`,
  `banner`). Success answers `201 { userId }` for JSON, or `303` to `/signon` for the form.
  Failure answers `303` with `Location` ending `/accounts/create-error` for both.
- **P11 Screens.** These are server components in the shared shell, drawn from the approved
  mockups: `/signon` (form, remember box, "Create account" card), `/signon/error`,
  `/accounts/create` (sign-on details + preferences; favourite categories come from the catalog's
  `listCategories` in `en_US`, plus "No favourite"), and `/accounts/create-error`. `/account`
  (protected, no mockup) is built from existing patterns (`PageHeading`, outlined `Card`) and
  shows the signed-on user name, account status and profile preferences. The header shows
  "Signed out · Sign on" / "Create account" when signed out, and the user name and a "Sign off"
  button (a `POST` to `/api/accounts/signoff`, which deletes the session row and cookie) when
  signed on. The layout reads the session on the server and passes it to `Header` as a prop. The
  footer adds "Sessions end after 15 minutes of inactivity", as drawn.

### Phases (all SWHM2-T-0015, in `tasks.md` order)

1. **Data model** (1.1–1.5): schema, the `web_session` table, the generated migration, and
   `src/checkout/store.ts` + `src/accounts/store.ts` (P1–P3).
2. **Account creation** (2.1–2.4): `profile.ts`, `customers.ts`, `registration.ts` and
   `POST /api/accounts/users` (P4, P5, P10).
3. **Sign-on and session** (3.1–3.7): `signon.ts`, `session.ts`, `web-session.ts`, the sign-on
   and sign-off routes, the five pages, and the header/footer changes (P6–P9, P11).
4. **Test harness**: unit tests beside each new `src/accounts/*.ts` (node env), route tests for
   the three new API routes (restore the rows they write), component tests for the new views,
   and one Playwright spec in `e2e/` for create account → sign on → `/account` → sign off. The
   locked suite in `tests/acceptance/customer-accounts/` runs unedited.
5. **CI**: `.github/workflows/ci.yml` already runs unit, e2e and both acceptance tiers on
   `vortex/**` pushes and PRs. No CI change is planned; the CI job only has to pass.

### Spec discrepancies

- **D1 Protected URL list** (R-0162): the legacy list lived in `signon-config.xml`, which was not
  analysed. Here the protected pages are `/account` (fixed by the locked e2e) and, later,
  checkout. Matching is per page (P7), not by exact URL string equality.
- **D2 Where the requested page is remembered** (R-0162, R-0163): the legacy filter kept it in the
  server session. Here it travels as `returnTo` on the sign-on URL and form, as the locked e2e
  requires. An anonymous visitor has no server session to hold it.
- **D3 Two user-name limits**: R-0005 says a sign-on user name is at most 50 characters, and R-0164
  says a new user ID is at most 25. Both hold: the table allows 50, and registration enforces 25.
  The "maximum password length" in R-0164 is not stated; 50 is used (R-0005, and the mockup's
  "Up to 50 characters").
- **D4 Language applied at sign-on** (R-0067): the session and cart language are set and stored.
  Rendering pages in that language, and the header switcher, belong to SWHM2-I-0010. The sample
  catalog is `en_US` only.
- **D5 Plain-text passwords** (R-0161) are kept as specified. The Business Owner's defect-register
  decision is still open (proposal "Open points"; PRODUCT.md). They are not hashed here, because
  hashing would fail C-0132.
- **D6 Menu label**: the brief names the entry "Account & sign-on"; the existing menu and every
  approved mockup show Account → "Sign on". The mockups win, and the menu is unchanged.
- **D7 Sign off** is not in the spec. A header "Sign off" is added so a signed-on user can end the
  session before the 15-minute timeout. It deletes the session row only.
- **D8 Template `users` table**: ARCHITECTURE.md says customer-accounts supersedes it. It is left in
  place (the template's `/api/users` routes and tests use it), and its removal is not in this
  change.
