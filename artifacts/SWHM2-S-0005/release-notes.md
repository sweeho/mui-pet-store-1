---
artifact: release-notes
sprint: SWHM2-S-0005
ticket: SWHM2-T-0027
author: planning
---

# Release notes — SWHM2-S-0005

## Customers can place an order

A signed-on customer can now go from **Cart** to **Checkout** and buy what is in the cart.

### New

- **Checkout in two steps** (`/checkout`):
  1. Shipping address and contact details.
  2. Billing address and card.
  - Shoppers who are not signed on go to sign-on first.
  - An empty cart shows the empty frame with a link back to the cart.
- **Addresses** need street line 1, city, state, zip code and country. An address missing one of
  these is refused. Street line 2 is optional.
- **Contact details** (family name, given name, e-mail, phone) are not checked. An empty e-mail is
  accepted.
- **Card expiry** is written as "month/year", for example 04/2008. A missing expiry, or one with no
  slash, reads as 01/2010.
- **Place order** records the customer, e-mail, date, language and region, total, contact
  details and the cart lines.
  - Every order carries the placeholder card 1234-2334, Duke Express, 10/2001, as the legacy store
    did. The card the customer entered is kept with the order details but is not used.
- **Order numbers** are unique and go up by one, for example 10011, then 10012.
- **Order confirmation** (`/checkout/orders/{id}`) shows the order. Its status reads "Submitted —
  awaiting approval" until order approval ships.

### Not available yet

- Order approval, fulfilment, invoicing and order e-mails. Placed orders wait for those
  capabilities.
- There is no Checkout entry in the left navigation. Use **Proceed to checkout** in the cart.

### For developers

- **Checkout code** lives in `src/checkout/`:
  - `credit-card`, `contact`, `ids`, `access` and `submit`, which applies the placeholder card.
  - `documents`: a hand-written XML reader and writer, with no new dependency.
  - `store` gains `storePaymentCard`, `recordOrder`, `getOrder`, `persistSequence` and
    `removeCreditCard`.
- **API:**
  - `POST /api/checkout/orders` takes JSON `{ items }` or the checkout form post.
  - `GET /api/checkout/orders/{id}` returns only the caller's own orders and never the entered card.
  - An anonymous caller is accepted as user `"anonymous"` (SWHM2-T-0024 tracks the decision).
- **New migration:** `drizzle/0004_*` adds `payment_card`, `sequence`, `checkout_order` and
  `checkout_order_line`. An order is a snapshot, with no foreign keys into `address`, `contact` or
  `credit_card`.
- **Acceptance runs:** `src/db/acceptance-setup.ts` gives each acceptance Jest file its own copy of
  the database.

### Known issues

None open. Open decisions:
- SWHM2-T-0024: anonymous order API.
- Clear-text card storage.

The screens differ from the mockups in shell chrome, field style and the mobile confirmation
layout. See `qa-test-report.md` § Design fidelity.

The evidence comes from `qa-test-report.md`:
- Unit suite: 35 suites and 191 tests passed.
- E2E: 18 tests passed.
- The locked checkout-and-payment acceptance tests pass.
