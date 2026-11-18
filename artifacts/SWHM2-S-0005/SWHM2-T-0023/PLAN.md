# PLAN — SWHM2-T-0023 Checkout and payment details

Change `swhm2-i-0005-checkout-and-payment-detail`. Read its `design.md` FIRST: the "Sprint
planning" section (P1–P10) and "Spec discrepancies" (SD1–SD6). Then read
`specs/checkout-and-payment/spec.md` and `test-cases.md`.

## Objective

A signed-on customer goes from Cart to Checkout, enters contact, shipping and billing addresses
and a card, and places an order. The order is recorded with a sequence-generated id and the
placeholder card, and the customer lands on the order confirmation. The work covers all 19
requirements and 27 scenarios of the change.

## Fixed interface contracts

These are set by the locked suite `tests/acceptance/checkout-and-payment/harness.ts` (header
comment). Do not change them. In short:

- **`src/checkout/credit-card.ts`:**
  - `createCreditCard(card)`
  - `getExpiryMonth(card)` and `getExpiryYear(card)`
- **`src/checkout/contact.ts`:** `createContact(data?)`.
- **`src/checkout/documents.ts`:**
  - `contactFromDocument` and `addressFromElement`
  - `creditCardToDocument` and `creditCardFromDocument`
  - `purchaseOrderToDocument`
- **`src/checkout/store.ts`** (the existing `storeAddress` and `storeCreditCard` are kept):
  - `removeCreditCard(db, id, { afterDelete? })`
  - `storePaymentCard`
  - `recordOrder` and `getOrder`
  - `persistSequence`
- **`src/checkout/ids.ts`:** `nextIdentifier(db, name)` and `getCounter(db, name)`.
- **`src/checkout/access.ts`:** `invokeCreditCardOperation(op, { credentials? })`.
- **Tables:**
  - `address` and `credit_card` (these exist)
  - `payment_card`, `sequence` and `checkout_order`
- **Routes:**
  - `POST /api/checkout/orders` with JSON `{ items: string[] }` answers `{ orderId }`.
  - `GET /api/checkout/orders/{id}` answers the order with `paymentCard`.

## Steps (tasks.md order)

1. **1.1–1.4 Data model** (design.md P2).
   - Add the tables to `src/db/schema.ts` and generate `drizzle/0004_*`.
   - Write `credit-card.ts`.
   - Add to `store.ts`: `storePaymentCard`, `recordOrder` (rejects without `paymentCard` and leaves
     no row), `getOrder` and `persistSequence`.
   - Add unit tests.
2. **2.1–2.4 Rules.**
   - Expiry (P4).
   - `ids.ts` (P3).
   - `contact.ts`, where an empty contact has an empty address.
   - `src/checkout/submit.ts`, which builds an order from cart lines and contact with the
     placeholder card and the `"1001"` sequence (P6).
3. **3.1–3.2 Documents.** `documents.ts` (P5, SD1) with unit tests.
4. **4.1 Access, routes and screens** (P6–P9).
   - Write `access.ts`, and `removeCreditCard` in a transaction.
   - Write `src/app/api/checkout/orders/route.ts` and `[id]/route.ts`, each with a route test
     (`@jest-environment node`, isolated database).
   - Replace the `/checkout` placeholder with the two-step `CheckoutView`.
   - Add the `/checkout/orders/[id]` confirmation page with `OrderConfirmationView`.
   - Add the "Checkout" entry to `MENU_ITEMS`.
   - Add component tests and a Playwright spec, `e2e/checkout.spec.ts`: sign on, add EST-1, go
     through checkout and see the confirmation with the placeholder card.
5. **Test harness** (P10).
   - Add a per-file database copy for the acceptance Jest run in `jest.acceptance.config.mjs`,
     with a setup file `src/db/acceptance-setup.ts`.
   - The locked checkout unit and E2E suites pass unedited.
   - The customer-accounts and shopping-cart acceptance suites still pass.
6. **CI.** No workflow change is needed.

## Gotchas

- Do not add foreign keys from `checkout_order` to `address`, `contact` or `credit_card` (P2).
  The locked resets delete those tables.
- The locked E2E case C-0054 has no session. The API must accept it (SD2).
- Do not add an XML dependency (P5).
- Never return the entered card from any route (P7).

## Design reference

Approved mockups are in `artifacts/SWHM2-S-0005/design/`; `MANIFEST.md` lists them.

| File | Route and state | Viewport |
| --- | --- | --- |
| `mockup-checkout-shipping-and-contact.html` | `/checkout`, step 1 | 1440 |
| `mockup-checkout-shipping-and-contact-mobile.html` | same | 390 |
| `mockup-checkout-billing-and-payment.html` | `/checkout`, step 2 | 1440 |
| `mockup-checkout-billing-and-payment-mobile.html` | same | 390 |
| `mockup-order-confirmation.html` | `/checkout/orders/{id}` | 1440 |
| `mockup-order-confirmation-mobile.html` | same | 390 |

The status panel on the confirmation reads "awaiting approval" (SD4). Colours, type and shape come
from the theme only.

## File/module ownership

Create:
- `src/checkout/{credit-card,contact,documents,ids,access,submit}.ts`, each with its `.test.ts`
- `src/app/api/checkout/orders/route.ts` and `[id]/route.ts`, each with its `route.test.ts`
- `src/components/checkout/CheckoutView.tsx` and `OrderConfirmationView.tsx`, with tests
- `src/app/(DashboardLayout)/checkout/orders/[id]/page.tsx`
- `e2e/checkout.spec.ts`
- `src/db/acceptance-setup.ts`
- `drizzle/0004_*` and `drizzle/meta/*`

Modify:
- `src/checkout/store.ts`
- `src/db/schema.ts`
- `src/app/(DashboardLayout)/checkout/page.tsx`
- `src/shell/menu.ts`
- `jest.acceptance.config.mjs`

Never edit `tests/acceptance/**` or anything under `openspec/`.

## Definition of Done

AC-1 to AC-27 on the ticket (one per scenario) are met. Each is shown by its acceptance case,
SWHM2-C-0037 to C-0063, passing. The project's own tests cover the new modules, routes and views.
