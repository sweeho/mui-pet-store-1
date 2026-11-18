---
artifact: plan
sprint: SWHM2-S-0008
ticket: SWHM2-T-0037
author: planning
change: swhm2-i-0008-order-notifications
---

# PLAN — SWHM2-T-0037 Order notifications

## Objective

Build the whole change `swhm2-i-0008-order-notifications`:
- the Mail and OrderApproval documents
- the mailer, which drops undeliverable mail without retry
- the three order e-mails behind switches that default to off
- the async sender and broker, with transactional sends
- order submission to the processing centre and invoice publication
- the caching locator
- best-effort wiring into the approval and fulfilment dispatchers

Read the change's `design.md` § Sprint planning first: Codebase findings, Decisions P1–P8 and
Spec discrepancies SD1–SD10. The locked `tests/acceptance/order-notifications/harness.ts` is the
interface contract: module names, signatures, queue names and the `NotifEnv` shape. Never edit
it or the locked test file.

## Steps (in `tasks.md` order)

1. **Documents (1.1, 1.2):** `src/notifications/mail-document.ts` (P3, SD1) and
   `src/notifications/order-approval.ts`, which reuses `src/approval/documents.ts` and
   `parseDocument` from `src/fulfilment/documents.ts` (P5, SD4, SD5).
2. **Mailer (2.1, 2.2):** `src/notifications/env.ts` (the `NotifEnv` type) and
   `src/notifications/mailer.ts` (P4).
3. **Order e-mails (3.1–3.4):** the switches and the three subject builders in
   `src/notifications/order-flow.ts`: `changeOrderStatus`, the shipped mail in `issueInvoice`,
   `processInvoice` and `sendCompletedOrderMail` (P6, SD9, SD10).
4. **Messaging (4.1–4.3):**
   - `src/notifications/broker.ts` and `src/notifications/sender.ts` (P2).
   - `submitPurchaseOrder` and `issueInvoice` (P6, SD2, SD6).
   - `src/notifications/runtime.ts` (`notifyOrders`), called from `src/approval/dispatch.ts` and
     `src/fulfilment/dispatch.ts` **after** their existing `message_outbox` writes, which do not
     change (P8, SD8).
5. **Locator (5.1, 5.2):** `src/notifications/locator.ts` (P7, SD3).
6. **Test harness:**
   - A unit test beside every new module, with a `@jest-environment node` header.
   - `runtime.test.ts`: with the switches off nothing is sent. With a switch on and the default
     transport, the mail is logged and dropped and the dispatcher does not throw. The existing
     outbox rows are unchanged.
   - The approval, fulfilment and checkout unit and acceptance suites stay green.
7. **CI:** no workflow change (design.md § Phases 7).

## Design reference

None. SWHM2-I-0008 has no approved mockup and no screen. The shell's "Notifications" entry keeps
the shared empty frame.

## File/module ownership

Create:
- `src/notifications/env.ts`
- `src/notifications/broker.ts`
- `src/notifications/sender.ts`
- `src/notifications/mail-document.ts`
- `src/notifications/order-approval.ts`
- `src/notifications/mailer.ts`
- `src/notifications/locator.ts`
- `src/notifications/order-flow.ts`
- `src/notifications/runtime.ts`
- `src/notifications/*.test.ts`

Modify:
- `src/approval/dispatch.ts`: one best-effort call, after the outbox writes
- `src/fulfilment/dispatch.ts`: same

Read-only:
- `src/approval/documents.ts`, `src/fulfilment/documents.ts`, `src/db/schema.ts`
- `tests/acceptance/**` (locked)

## Definition of Done

AC-1 to AC-18 of SWHM2-T-0037, one per scenario. Each is proven by its locked case
SWHM2-C-0144 to SWHM2-C-0161 in `tests/acceptance/order-notifications/`, and every `tasks.md`
line is done.
