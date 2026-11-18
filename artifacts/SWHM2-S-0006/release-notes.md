---
artifact: release-notes
spec: 1
status: complete
author_role: planning
sprint: SWHM2-S-0006
capability brief: SWHM2-I-0006
branch: vortex/sprint/swhm2-s-0006-d274d678
upstream: [artifacts/SWHM2-S-0006/qa-test-report.md]
---

# Release notes — SWHM2-S-0006

## Added

- **Automatic approval of small orders.** A US order under 500, or a Japan order under 50,000, is
  approved as soon as it is placed. An order of exactly 500 (US) or 50,000 (Japan), and every order
  from another country, waits as Pending. (SWHM2-T-0029)
- **Order approval screen for administrators** (`/admin/orders`, sign in at `/admin/login`).
  - It lists every order with its status. Tabs filter by status.
  - Pending orders can be marked Approved or Denied. Changes are held, and counted, until
    **Commit**. **Discard changes** resets them.
  - Only changed orders are sent. Approved, Denied and Completed orders show their status with no
    control. (SWHM2-T-0029)
- **Approved orders go to the supplier.** Each approved order produces a supplier purchase order
  with all its lines. (SWHM2-T-0029)
- **Changed orders are queued for customer notification.** The e-mail itself comes with order
  notifications. (SWHM2-T-0029)
- **Late or repeated decisions do nothing.** A decision for an order that is no longer Pending
  changes nothing and sends nothing. (SWHM2-T-0029)

## Changed

- Placing an order now hands it to approval straight away. (SWHM2-T-0029)
- Approved and Pending states use new green and amber colours, and order ids, dates and totals
  use a monospace font. (SWHM2-T-0029)

## Upgrade notes

- **Migration** `drizzle/0005_*` adds `purchase_order`, `order_line`, `order_manager`,
  `message_outbox` and `admin_session`. It runs on first use, like the earlier ones.
- **Admin credentials** come from `ADMIN_USER` and `ADMIN_PASSWORD`. When they are unset, both
  default to `j2ee`. **Set both in every deployed environment.**
- **New dependency:** `@fontsource-variable/jetbrains-mono`.
- **Demo data:** the database keeps at least 4 Pending orders and 1 Approved order for the
  approval screen. Demo orders are added only to make up a shortfall.

## Not included

- No navigation entry for the approval screen. Open `/admin/orders` directly.
- Order fulfilment, customer e-mails, wider order administration and batch jobs belong to later
  capabilities. Approved orders and notifications wait in the outbox for them.
- The admin session has no expiry and its cookie is not marked `Secure`. Admin accounts and roles
  come with administration of orders (SWHM2-I-0009).
- The screen differs from the mockups: it uses the site shell, opens on the All tab, and labels
  the button "Commit" with the count beside it. See `qa-test-report.md` § Design fidelity.

## Verification

Verified at integration QA: PASS, no defects. See `artifacts/SWHM2-S-0006/qa-test-report.md`.

## Compliance / Control Evidence

| Control | Evidence | Location | Status | Exception |
| --- | --- | --- | --- | --- |
| Release contents recorded | this file | `artifacts/SWHM2-S-0006/release-notes.md` | Satisfied | — |
| Release verified before land | QA PASS verdict | `artifacts/SWHM2-S-0006/qa-test-report.md` | Satisfied | — |
| Known limitations disclosed | Not included, Upgrade notes | this file | Satisfied | Default admin credentials (SD1) |
