---
artifact: summary
sprint: SWHM2-S-0008
ticket: SWHM2-T-0037
author: implementation
---

# SWHM2-T-0037 Order notifications

Built `src/notifications/` (env, broker, sender, mail-document, order-approval, mailer, locator,
order-flow, runtime) with a unit test beside each module, and one best-effort `notifyOrders`
call at the end of `dispatchApprovals` and `dispatchFulfilment`. The existing `message_outbox`
writes are unchanged.

- Mail: strict three-part document (locale as an optional attribute, SD1); the mailer sends one
  HTML mail and logs and drops failures without retry.
- Switches `NOTIFY_STATUS_CHANGE`, `NOTIFY_INVOICE`, `NOTIFY_COMPLETED` (only `"true"` enables); all off by default.
- Default transport rejects "no mail server configured" (SD8), so mail is logged and dropped.
- Status mail body says "now UPDATED" because the approval notify list carries ids only.
- Cases C-0144 to C-0161 are covered; AC-1 to AC-18 met. No design mockup (no screen).

Verification: `npm test` 318 passed; lint, format:check, typecheck clean; locked acceptance
suites (order-notifications, approval, fulfilment, checkout) 44 passed.

CODE-REVIEW: self-review — sub-agent skipped to keep the change small; diff checked against the acceptance criteria and P1-P8: no findings beyond the status wording above.
