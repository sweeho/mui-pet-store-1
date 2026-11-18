---
artifact: release-notes
spec: 1
status: complete
author_role: planning
sprint: SWHM2-S-0008
capability brief: SWHM2-I-0008
branch: vortex/sprint/swhm2-s-0008-c40fc5c6
upstream: [artifacts/SWHM2-S-0008/qa-test-report.md]
---

# Release notes — SWHM2-S-0008

## Added

- **Order e-mails to customers.** The store can send three e-mails per order (SWHM2-T-0037):
  - "Java Pet Store Order Status: <id>" when the order's status changes
  - "Java Pet Store Order Shipped: <id>" when an invoice ships part or all of it
  - "Java Pet Store Order COMPLETED: <id>" when it is fully shipped. A partial shipment never
    sends this one.

  Each goes to the e-mail address on the order, in the order's language.
- **A switch for each e-mail, all off by default.** A fresh install sends no customer e-mail.
  (SWHM2-T-0037)
- **Mail failures never affect an order.** If the mail server is missing or a send fails, that
  e-mail is logged and dropped, never retried. (SWHM2-T-0037)
- **Several recipients per e-mail.** The address can list more than one, separated by commas.
  (SWHM2-T-0037)
- **Order processing centre messages.** Placed orders and issued invoices are handed on as
  messages, and only after the change behind them is saved. (SWHM2-T-0037)

## Changed

- Order approval and fulfilment now notify customers after recording their messages. The records
  in `message_outbox` are unchanged. (SWHM2-T-0037)

## Fixed

- Nothing; no defects were found this sprint.

## Upgrade notes

- New environment settings. All are optional, and all switches are off unless set to `"true"`:
  - `NOTIFY_STATUS_CHANGE`
  - `NOTIFY_INVOICE`
  - `NOTIFY_COMPLETED`
  - `MAIL_FROM`: the sender. Defaults to `petstore@localhost`.
- No database migration.

## Not included

- **Actual delivery.** No mail server is connected yet, so every e-mail is logged and dropped
  even with a switch on (SWHM2-T-0038).
- No screen for the switches. The "Notifications" menu item still opens the empty frame.
- No translated e-mail body copy (internationalisation), and no channels other than e-mail.
- The status e-mail says the order was "UPDATED" rather than naming its new status.

## Verification

- Integration QA PASS on all 18 scenarios: 318 unit tests and 21 E2E tests passed, and the
  order-notifications acceptance suite passes (`qa-test-report.md`).

## Compliance / Control Evidence

- Change `swhm2-i-0008-order-notifications`; tickets SWHM2-T-0036, SWHM2-T-0037, SWHM2-T-0039 and
  SWHM2-T-0040.
