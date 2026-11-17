# Rebuild guidance

Orientation for the rebuild of the legacy Java Pet Store. The per-capability delta specs under `openspec/changes/sx-*/specs/` are authoritative. `api/openapi.yaml`, `architecture/erd.mermaid` and `architecture/schema.sql` are evidence of the legacy system, not a design; where they disagree with a delta spec the delta spec wins.

## Build order

`build/manifest.yaml` carries the schedule. Foundations first: catalog-browsing, customer-accounts, internationalisation. Then shopping-cart, checkout-and-payment, order-approval, then order-fulfilment, order-notifications, admin-order-management, and batch-operations last (it reads fulfilment and catalog data).

## Points to carry over deliberately

- Order lifecycle states (PENDING, APPROVED, DENIED, COMPLETED) and automatic approval limits by region are business rules; see order-approval.
- Retention (180 days), the finance extract format and batch exit codes are operational contracts; see batch-operations.
- Money values are decimals; the legacy stores dates as epoch milliseconds (PO_DATE) and card expiry as text.

## Legacy defects to rule on, not copy

- Passwords are stored in plain text and card numbers in clear (SIGNON_USER, CREDIT_CARD).
- The admin login page pre-fills default credentials (finding on ADMIN-SCR-0001).
- Order submission uses a placeholder payment card rather than the customer's card (checkout-and-payment).
- ORDER_MANAGER has no declared foreign key to PURCHASE_ORDER; PO_LINE_ITEM carries no foreign key to ITEM.

## Open questions

Each capability's `design.md` lists open questions and disputed records. Several order-fulfilment records await review; do not treat them as settled.
