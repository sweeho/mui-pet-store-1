# Pet Store Modernisation

_PRD v4 · approved 2026-11-17 · by sweeho@gmail.com. Published from the Design Workbench — edit it there, not here._

## Summary

Pet Store Modernisation replaces the legacy Java Pet Store with a new application that keeps the behaviour the approved specification records. Shoppers browse a localised catalog, fill a cart, sign on and check out. Orders are approved automatically or by an administrator, fulfilled from stock, invoiced and notified by e-mail. Administrators manage orders and read sales reports, and scheduled batch jobs extract, purge, check and back up data.

## Context

A legacy system is being replaced. Its behaviour was extracted, reviewed and approved as the specification under `openspec/changes/`. That specification is the only source for this document. No other documents were uploaded, so no disagreement between documents and specification exists to record.

## Goals

- Shoppers can browse categories, products and items and search by keyword in their own locale.
- Customers can create an account, sign on, and have their language preference applied.
- Shoppers can keep one quantity per item in a per-session cart with line totals and a subtotal.
- A signed-on customer can turn a cart into an order with contact, address and payment details.
- Small US orders (total under 500) and small Japan orders (total under 50000) are approved automatically; all other orders wait for an administrator.
- Approved orders become supplier purchase orders, are fulfilled from stock and invoiced; an order is COMPLETED only when every line has shipped.
- Customers and the order processing centre receive e-mail about order status, shipment and completion, gated by administrator switches.
- Administrators can list orders by status, approve or deny pending orders on an explicit Commit, and read revenue or quantity sales reports.
- The storefront is available in English, Japanese and Chinese with default and fallback behaviour.
- Operations get a daily backup, a daily order extract, a weekly purge that runs only after a successful extract, and report jobs with defined exit codes.

## Non-goals

- Password hashing policy: the specification does not define one.
- Add-to-cart behaviour inside catalog browsing, and translation of new content.
- Interactive screens for batch operations.

## Users

- Shopper: browses, searches and fills a cart, anonymous or signed on.
- Customer: a signed-on shopper with an account, profile and payment details who places orders.
- Administrator: signs in to the admin area, approves or denies orders and reads sales reports.
- Stock clerk: updates inventory quantities.
- Finance: receives the daily order extract and its failure notice.
- Operations: receives batch failure notices and relies on the nightly and weekly jobs.

## User journeys

- Find a pet: landing page, category list, product list, item detail, search results.
- Buy a pet: item detail, cart, sign-on page (when not signed on), checkout, order confirmation.
- Create an account: sign-on page, create-account page, sign-on error page on failure.
- Change language: any storefront page, locale change, same page in the chosen language.
- Approve orders: admin login page, admin home, manage orders (rich client), pending order list, Commit.
- Read sales reports: admin login page, admin home, rich client report screen, chart.
- Update stock: inventory screen, submit, inventory screen with new quantities.

## Capability map

- site-shell: landing page, global navigation, shared layout and shared empty, error and loading frames.
- catalog-browsing: locale-filtered paged category, product and item listings, single lookups, keyword search and the catalog data model.
- customer-accounts: sign-on, session timeout, protected pages, account creation and the customer, account, contact, card and profile model.
- shopping-cart: per-session cart with one quantity per item, quantity rules, line totals and subtotal.
- checkout-and-payment: address, contact and card capture, the order record and document, and unique identifier generation.
- order-approval: automatic approval by regional limit, administrator approve or deny on Commit, approval message processing and status values.
- order-fulfilment: supplier purchase orders and lines, stock-based fulfilment, invoices, id counters and the inventory screen.
- order-notifications: status, shipment and completion e-mails with their switches, mail document, invoice publication and undeliverable-mail handling.
- admin-order-management: admin access control, login and home screens, rich-client request protocol, order listing by status and sales reports.
- internationalisation: language selection with default and fallback, locale-keyed content, currency formatting and Shift-JIS and JIS decoding.
- batch-operations: nightly and weekly jobs, their logging, exit codes and ordering, and the inventory population load.

## Screens

- Landing page with global navigation.
- Category, product, item and search results screens.
- Sign-on page, sign-on error page, create-account page and user-creation error page.
- Cart screen with line totals and subtotal.
- Checkout screens for shipping, billing and payment details.
- Inventory screen: each item id with its existing quantity, a new-quantity input and an update checkbox, submitted with one button.
- Admin login page asking for user ID and password, admin home page offering Launch Rich Client and logout, and a login-error page linking back to sign-in.
- Shared empty, error (with retry) and loading frames.

## Constraints and assumptions

- Locale defaults to en_US on the first request; a missing catalog row in the requested locale returns nothing, and a missing screen definition falls back to the default locale.
- Sessions end after 15 minutes of inactivity.
- Order statuses are PENDING, APPROVED, DENIED and COMPLETED.
- Orders from locales other than US and Japan are never auto-approved.
- Sales report dates use MM/dd/yyyy.
- The specification records plain-text sign-on passwords and a placeholder payment card on order submission; the replacement is assumed to keep that behaviour until the Business Owner decides otherwise.

## Open questions

- Manifest and specification differ in names: `build/manifest.yaml` points at `openspec/changes/sx-*` directories, which do not exist; the approved specifications are in `openspec/changes/swhm2-i-*`. This PRD follows the specification directories.
- The specification has a `site-shell` capability that the manifest lacks; this PRD adds it to the capability map.
- Plain-text passwords and the placeholder payment card: keep, or replace with proper handling in the new system?
- The rich client is launched through a Java Web Start descriptor; should the replacement keep that or offer a web-based admin screen?
