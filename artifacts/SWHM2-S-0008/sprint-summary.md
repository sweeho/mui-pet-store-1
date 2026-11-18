---
artifact: sprint-summary
spec: 1
status: complete
author_role: planning
sprint: SWHM2-S-0008
capability brief: SWHM2-I-0008
branch: vortex/sprint/swhm2-s-0008-c40fc5c6
upstream: [artifacts/SWHM2-S-0008/SPRINT-PLAN.md, artifacts/SWHM2-S-0008/qa-test-report.md]
---

# Sprint summary — SWHM2-S-0008

**Goal:** SWHM2-I-0008: Order notifications. **Outcome: met.** Integration QA gave PASS on all 18
scenarios of change `swhm2-i-0008-order-notifications`. It found no defects, and none is left
open.

## Tickets

| Ticket | Type | Title | Outcome |
| --- | --- | --- | --- |
| SWHM2-T-0036 | TASK | Sprint plan — SWHM2-S-0008 | DONE (`89276d1`): design.md planning section P1–P8 and SD1–SD10, `tasks.md` tagged, ARCHITECTURE.md updated |
| SWHM2-T-0037 | FEATURE | Order notifications | DONE (`ca7d10e`): every `tasks.md` line; see `SWHM2-T-0037/summary.md` |
| SWHM2-T-0039 | TASK | Integration QA report — SWHM2-S-0008 | DONE (`3f60b47`): PASS, no defects |
| SWHM2-T-0040 | TASK | Sprint close bundle — SWHM2-S-0008 | DONE: this file and `release-notes.md` |
| SWHM2-T-0038 | TASK (improvement) | Configure a real outbound mail transport | Backlog; not in this sprint |

## What shipped

All of the goal shipped as code, in `src/notifications/`:
- **Mail document.** A strict three-part Mail document (Address, Subject, Content). A request
  with parts missing or out of order is rejected. The order's locale travels as an attribute
  (SD1).
- **Mailer.** It sends one HTML mail per request: several recipients allowed, the default
  sender, the current date and X-Mailer "JavaMailer". A failed send is logged once and dropped,
  never retried.
- **Order e-mails.** Status, shipped and completed e-mails use the spec's subjects and go to the
  order's address in its locale. Each has its own switch (`NOTIFY_STATUS_CHANGE`,
  `NOTIFY_INVOICE`, `NOTIFY_COMPLETED`), and all three are off by default. The completed e-mail
  goes only when an invoice completes the order.
- **Messaging plumbing.** An in-memory broker whose sends go out only when the transaction
  commits. Order submission to the processing centre (XML, cart emptied, billing e-mail and order
  id returned). Invoice publication to the `invoice` topic. A caching locator with a wrapped
  error.
- **Wiring.** The approval and fulfilment dispatchers call `notifyOrders` best-effort, after
  their existing `message_outbox` writes, which are unchanged.

## Divergence from plan

- The status e-mail body says the order is "UPDATED", not its new status. The approval notify
  list carries order ids only (noted in `SWHM2-T-0037/summary.md`).
- When all three switches are off, `notifyOrders` returns before it calls `issueInvoice`. So the
  in-process `invoice` topic is published only when a switch is on. The durable record of each
  invoice is still the `supplier-invoice` row in `message_outbox`, as before.
- Nothing else diverged. The code follows P1–P8.

## Verification

From `qa-test-report.md` and `integration-test-result.md`, run on the integrated sprint branch:
- `npm test`: 64 suites, 318 tests passed.
- `npm run test:e2e`: 21 passed, 0 skipped.
- Acceptance suite: the order-notifications suite passes. 179 tests pass in total; 3 suites fail
  only because they import modules from later capabilities (`src/batch/jobs`,
  `src/i18n/format`, `src/admin/launch`).
- Coverage of `src/notifications`: 97.87% statements, 100% lines.

## Defects Raised

None.

## Open points carried forward

- **SWHM2-T-0038:** no mail server is configured. Every e-mail is logged and dropped even with a
  switch on, until a transport is connected.
- **Open questions on the brief, still undecided:**
  - who turns the switches on and where (today: environment variables)
  - whether to keep the legacy "Java Pet Store" / "JavaMailer" names
  - whether the XML formats still matter
  - whether to keep the locator requirements R-0108 and R-0137
- **Spec discrepancies SD1–SD10:** recorded in the change's `design.md` for SME review. SD2
  (invoice topic vs. outbox) and SD6 (the checkout route is unchanged; R-0102 is met at library
  level) matter most for later capabilities.

## Retrospective

**Went well**
- The locked acceptance harness named every module and signature. The plan built to it, and the
  feature passed all 18 cases on its first QA run.
- Notifying after the existing outbox writes kept the approval, fulfilment and checkout suites
  green without touching them.
- One FEATURE for the whole change: one implementation run, no hand-offs between tickets.

**Could improve**
- The plan did not say what status text the status e-mail carries when the approval notify list
  holds ids only. A plan should name the data each new consumer needs, not just where it plugs in.
- The plan said to call `issueInvoice` for every invoice but did not say whether that should
  happen when all switches are off. An "always" or "only when on" in the plan would have removed
  the ambiguity.
- The implementation's code review was a self-review only.

## Compliance / Control Evidence

- Spec traceability: 18 scenarios → 18 ACs on SWHM2-T-0037 → cases SWHM2-C-0144 to SWHM2-C-0161,
  all PASS (`qa-test-report.md`).
- Every `tasks.md` line is tagged and stamped by the platform (`c1e9632`).
- Root docs: ARCHITECTURE.md gained the "Outbound e-mail" integration point and the
  best-effort-notification Key Decision during planning. No further change was needed at close.
  PRODUCT.md, DESIGN.md and AGENTS.md are unchanged.
