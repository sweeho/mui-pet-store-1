## Legacy implementation notes

- Credit card: CMP entity bean CreditCardEJB with String fields cardNumber, cardType, expiryDate. Expiry month and year are derived by splitting on the first slash; defaults "01" and "2010" apply when absent. ejb-jar.xml grants unchecked access to all methods and uses transaction attribute Required.
- Address and ContactInfo: plain data classes with DOM (de)serialisation via XMLDocumentUtils; a ContactInfo EJB creates an address bean on creation, looking it up through the address service.
- Unique ids: UniqueIdGeneratorEJB uses a Counter entity keyed by name; the id is name concatenated with the incremented count.
- Order web action submits a fixed placeholder card instead of the customer's card (OrderHTMLAction).
- Database: Oracle and Cloudscape/Derby DDL under legacy-source/db/schema; card numbers are stored in clear text.
- Consolidated records carry keys that differ from the pass-file keys; statements truncated in the stage prompt were reconstructed from the component code. Reviewers should check CHK-REQ-0001, CHK-REQ-0004 and CHK-REQ-0005 wording (reject on wrong root) against the code.

## User interface

No screen records were extracted for this capability; its user interface is unspecified.

## Sprint planning (SWHM2-S-0005)

Planned on SWHM2-T-0022. The whole change is one FEATURE, **SWHM2-T-0023**, plan at
`artifacts/SWHM2-S-0005/SWHM2-T-0023/PLAN.md`. Approved mockups: `artifacts/SWHM2-S-0005/design/`.

### Codebase findings

- `src/checkout/store.ts` already has `storeAddress` and `storeCreditCard` (customer-accounts calls
  them), and the `address` and `credit_card` tables exist (`drizzle/0002_*`) with the required
  columns NOT NULL. `account.card_id` and `contact.address_id` reference them.
- `/checkout` is a placeholder page behind `requireSignOn("/checkout")`
  (`src/app/(DashboardLayout)/checkout/page.tsx`). The cart's "Proceed to checkout" already goes
  there, through sign-on when signed out. `MENU_ITEMS` (`src/shell/menu.ts`) has no Checkout entry.
- The cart: `getRequestCart()` (`src/cart/store.ts`), `listCart()` (`src/cart/listing.ts`), and the
  `/cart` page's catalog lookup (unit cost = `listPrice`, `STOREFRONT_LOCALE`).
- The session: `getWebSession()` gives `username` and `language`; `DEFAULT_LANGUAGE` is `en_US`.
- The locked suite `tests/acceptance/checkout-and-payment/` fixes the module names, signatures and
  tables (its `harness.ts` header). Its Playwright spec POSTs `/api/checkout/orders` with JSON
  `{ items: ["EST-1"] }` and **no session**, then GETs the order, also with no session.
- Both the checkout and customer-accounts locked suites `DELETE FROM credit_card` and `address` in
  the same shared test database (`jest.acceptance.config.mjs` → `src/db/test-setup.ts`). Because
  `account` references `credit_card`, checkout's reset fails whenever customer-accounts rows are
  present, and parallel files see each other's row counts.
- There is no XML library in `package.json`, and the node test environment has no DOM.

### Decisions

- **P1 Modules.** As the harness fixes: `src/checkout/credit-card.ts`, `contact.ts`,
  `documents.ts`, `ids.ts`, `access.ts`, and the existing `store.ts` extended. Pure modules take no
  db; stores take the db first.
- **P2 Data model (migration 0004).**
  - `payment_card(id, card_number, card_type, expiry_date)`, all required, number in clear text.
  - `sequence(name PK, counter integer NOT NULL)`.
  - `checkout_order`:
    - `order_id` text PK, `user_id`, `email_address`, `order_date` (ms), `locale`, `total_price`
      real.
    - `ship_to` and `bill_to` contact snapshots as JSON text, required.
    - The order's card as `card_number`, `card_type`, `expiry_date`, all required.
    - `entered_card_id`, nullable, references `payment_card`.
  - `checkout_order_line(order_id → checkout_order ON DELETE CASCADE, line_no, item_id, quantity,
    unit_price)`.
  - An order keeps a snapshot of contact, addresses and card. It has no foreign keys into
    `address`, `contact` or `credit_card`, so a later edit to a customer record never rewrites a
    placed order, and the two locked suites' resets do not block each other.
- **P3 Identifiers.**
  - `nextIdentifier(db, name)` runs in one transaction: insert the counter at 0 if absent, add 1,
    return `name + counter`.
  - Orders use the sequence named `"1001"`, so the first order id is `10011`. The confirmation
    mockup shows that id.
- **P4 Expiry.** `getExpiryMonth`/`getExpiryYear` split `expiryDate` on the first `/`. A missing
  value or one with no slash gives `"01"` / `"2010"`.
- **P5 Documents.**
  - `documents.ts` has a small hand-written reader and writer for the few flat elements involved.
    No new dependency is added.
  - Readers find children by element name, not position, and throw on a wrong root element.
  - Element text is entity-escaped on write and decoded on read.
  - An empty element reads as `""`, with no validation.
  - The purchase order document is built at submission and covered by tests. Nothing consumes it
    until order approval (SWHM2-I-0006).
- **P6 Submission.** `POST /api/checkout/orders` takes two kinds of request.
  - **Form post** (the checkout page). It reads the shopper's cart and the posted shipping
    contact, billing address and card, then:
    - stores the entered card with `storePaymentCard` and keeps it as `entered_card_id`;
    - records the order with the placeholder card `1234-2334` / `Duke Express` / `10/2001`
      (R-0152);
    - empties the cart;
    - answers 303 to `/checkout/orders/{id}`.
  - **JSON `{ items: string[] }`** (the locked contract). Each item goes in at quantity 1 at its
    list price, with the contact from `createContact()`, and the response is `{ orderId }`.
  - **Common to both:**
    - `user_id` is the signed-on user name, or `"anonymous"` without a session (SD2).
    - The locale is the session language, else `en_US`.
    - The total is the sum of quantity × list price.
    - `email_address` is the shipping contact's e-mail.
    - The body must contain at least one line; an empty one gets a 400.
- **P7 Reading an order.** `GET /api/checkout/orders/{id}` answers the order, including
  `paymentCard` (the placeholder) and lines.
  - It never includes the entered card.
  - It answers only when the order's `user_id` matches the requester (signed-on user name, else
    `"anonymous"`); otherwise it answers 404.
- **P8 Screens.**
  - **`/checkout`** stays sign-on protected. It is one page with a two-step client form
    (Shipping and contact, then Billing and payment, with "Same as shipping address"). Both steps
    are submitted by one form post on "Place order", so no draft is stored between steps.
  - **An empty cart** at `/checkout` shows `EmptyFrame` with a link to `/cart`.
  - **Confirmation** is `/checkout/orders/[id]`, sign-on protected and only for the order's own
    user. It shows the order details, lines, ship-to and bill-to, and the placeholder card notice.
    Its status panel reads "Submitted — awaiting approval" until order approval ships (SD4).
  - **Navigation:** add a "Checkout" entry under Shop in `MENU_ITEMS`.
  - Required-field messages follow the mockups. Name, phone and e-mail are not validated (R-0151).
- **P9 Access.** `invokeCreditCardOperation(op, { credentials? })` permits every caller and every
  operation (R-0156). `removeCreditCard` runs the delete and `afterDelete` in one
  `db.transaction`.
- **P10 Test harness.** `jest.acceptance.config.mjs` gains a per-file setup that points
  `DATABASE_PATH` at a fresh copy of the database prepared by global setup. Each acceptance test
  file then has its own database, so the locked suites' resets cannot collide. Locked tests are
  not edited.

### Phases (in `tasks.md` order)

1. **Data model.** Schema, the generated migration `drizzle/0004_*`, `credit-card.ts`, and the new
   store functions, each with unit tests.
2. **Rules.** `ids.ts`, expiry, `contact.ts` and submission with the placeholder card.
3. **Documents.** `documents.ts` with unit tests.
4. **Access.** `access.ts`, `removeCreditCard`, the routes, the two screens and the nav entry. Add
   route tests and a Playwright spec for cart → checkout → confirmation.
5. **Test harness.** Make the per-file acceptance database change (P10). The locked unit and E2E
   checkout suites must pass unedited, and the customer-accounts and shopping-cart suites must
   stay green.
6. **CI.** No workflow change is needed. The existing CI runs the unit, acceptance and E2E tiers
   on `vortex/**` pushes and pull requests.

## Spec discrepancies

Recorded here, not edited into the delta spec. Also posted on SWHM2-T-0022.

- **SD1 Contact document order.**
  - The spec says ContactInfo's children are FamilyName, GivenName, Address, Email, Phone.
  - The locked harness uses GivenName, FamilyName, Telephone, Email, Address, and the element name
    `Telephone`, not `Phone`.
  - Readers match by name (P5), and the writer follows the harness.
- **SD2 Order submission without sign-on.**
  - The brief sends signed-out shoppers to sign-on.
  - The locked Playwright case C-0054 submits and reads an order with no session.
  - The pages stay protected. The API accepts an anonymous caller as user `"anonymous"`, and can
    read only `"anonymous"` orders (P6, P7).
  - This opens an unauthenticated order-creation path. It is raised as improvement SWHM2-T-0024
    for a Business Owner and security decision.
- **SD3 Entered card.**
  - Legacy discarded the customer's card.
  - The mockup says "The card you enter here is saved to your order details".
  - The card is stored in `payment_card` and linked to the order, but never used as the order's
    card and never returned by the API (P6, P7).
- **SD4 Status on confirmation.**
  - The confirmation mockup shows "Approved", which order approval (SWHM2-I-0006) decides.
  - Until that ships, the panel says the order is awaiting approval.
- **SD5 Order validation.**
  - The spec's legacy notes flag CHK-REQ-0001/0004/0005 wording for review.
  - The harness confirms each one: creation with or without data, an Address root check, a
    CreditCard root check. No change is needed.
- **SD6 Clear-text card numbers.**
  - R-0158 stores card numbers unencrypted, as legacy did.
  - That is kept as specified. It is a PCI concern for the Business Owner, already noted in the
    PRD's placeholder-card decision.
