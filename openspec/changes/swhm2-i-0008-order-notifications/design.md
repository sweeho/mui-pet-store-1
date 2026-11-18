# Design notes: legacy implementation of order-notifications

## User interface
No screen records were extracted for this capability; its user interface is unspecified.

## Legacy implementation
- Mailer: an EJB 2.0 message-driven bean (container transaction) on a JMS queue parses a Mail XML document (Address, Subject, Content, validated by DTD) and sends it via JavaMail as HTML. Sender from the session default, non-strict recipient parsing, X-Mailer "JavaMailer". Failures are logged to stderr and the message is dropped, no retry.
- Order processing centre (opc): three administrator switches (status change, invoice, completed), all default off, gate the e-mails. Address and locale come from the purchase order. Subjects: "Java Pet Store Order Status/Shipped/COMPLETED: <order id>". Completion is sent as the order id to a completed-order mail queue only when an invoice completes the order.
- Petstore: sends the completed purchase order as XML asynchronously to the processing centre, empties the cart, returns billing e-mail and order id.
- Async sender: puts a text message on a queue within the caller's transaction.
- Service locator (web tier): caches homes, queues, factories, topics and data sources by name; URL/boolean/string entries are not cached. Lookup failures are wrapped in a single locator error.
- OrderApproval XML document: one or more Order entries; validated with document type check when validation is on.

## Open points
- Record keys in the pass files differ from the consolidated keys; OF-REQ-0003 as consolidated (invoice topic publication) differs from the pass-file record of that key (supplier screen security). Needs SME review.

## Sprint planning (SWHM2-S-0008)

Planned on SWHM2-T-0036. One FEATURE, **SWHM2-T-0037**, owns every line of `tasks.md`. The
locked `tests/acceptance/order-notifications/harness.ts` is the interface contract: its header
names every module, function, queue and env field. Build to it exactly.

### Codebase findings

- `src/notifications/` does not exist. The locked suite imports eight modules from it: `env`,
  `broker`, `sender`, `mail-document`, `order-approval`, `mailer`, `locator`, `order-flow`.
- The triggers already exist, written by earlier capabilities:
  - `src/approval/handler.ts` pushes each decided order onto `env.notifyList`.
    `src/approval/dispatch.ts` records it in `message_outbox` as queue `customer-notification`.
  - `src/fulfilment/fulfilment.ts` pushes every invoice onto `env.invoiceQueue`, and each order
    it completes onto `env.completedOrderQueue`. It pushes only after its transaction commits.
    `src/fulfilment/dispatch.ts` records them as `supplier-invoice` and `completed-order`.
  - The locked suites for checkout, approval and fulfilment assert those outbox rows, so they
    must stay exactly as they are.
- An OrderApproval document already exists in `src/approval/documents.ts`
  (`buildApprovalXml` / `parseApprovalXml`, with `<OrderStatus>` APPROVED or DENIED).
  `src/fulfilment/documents.ts` has `parseDocument(xml, {validate})`, which returns the root
  name and checks a DOCTYPE when one is declared.
- The order's e-mail and locale are stored in `checkout_order.email_address` and
  `checkout_order.locale`.
- `package.json` has no mail library. No SMTP server is configured anywhere.
- `.github/workflows/ci.yml` already runs the unit, E2E and acceptance suites on `vortex/**`
  pushes and PRs. The acceptance Jest config picks up `tests/acceptance/**`.
- This capability has no approved mockup and no screen.

### Decisions

- **P1 Module layout.** Use the harness's eight modules under `src/notifications/`, plus
  `runtime.ts` for wiring into the app (P8). Each module gets a unit test beside it.
- **P2 Broker (R-0109, R-0110).** `createBroker()` keeps one in-memory store per env:
  `queue(name).messages` and `topic(name).published`. `begin()` returns a Tx that buffers
  sends. `commit()` appends what it buffered, and `rollback()` drops it.
  `sendMessage(env, queue, text, tx?)` places exactly one text message. With `tx`, the message
  goes out only on commit. Queue names: `opc-order`, `async-sender`, `completed-order-mail`,
  `mail`. The topic is `invoice`.
- **P3 Mail document (R-0190, R-0135).** `<Mail><Address/><Subject/><Content/></Mail>`, with
  text XML-escaped.
  - `parseMailDocument` throws unless the root is `Mail` with exactly those three element
    children, in that order.
  - The order's locale travels as an optional `locale` attribute on `<Mail>` (SD1).
    `parseMailDocument` returns `{address, subject, content}`, plus `locale` only when the
    attribute is present.
- **P4 Mailer (R-0104, R-0106, R-0136).** `processMailMessage(env, xml)` works as follows:
  - It throws on an invalid document.
  - Otherwise it calls `env.transport.send` once with:
    - `to`: recipients split from the address on commas and whitespace, blanks dropped
      (non-strict)
    - `from`: `env.defaultSender`
    - `subject` as given, `html` = the content
    - `sentDate`: `env.now()`
    - `headers`: `{"X-Mailer": "JavaMailer"}`
    - `locale`: from the document, when present
  - When `send` rejects, it calls `env.log` with the reason and resolves. It never retries.
- **P5 OrderApproval (R-0105, R-0107).** `order-approval.ts` reuses `src/approval/documents.ts`
  rather than defining a second format:
  - `buildOrderApproval([{orderId, approved}])` maps `approved` to APPROVED or DENIED and calls
    `buildApprovalXml`.
  - `parseOrderApproval(xml, {validate})` throws when the document is not well formed or, with
    `validate`, when its root is not `OrderApproval` (via `parseDocument`). It returns
    `{orderId, approved}[]`.
- **P6 Order flow (R-0102, R-0103, R-0111, R-0112, R-0113, R-0189).** `order-flow.ts`:
  - `submitPurchaseOrder(env, {orderId, billingEmail, items})` sends one XML purchase order
    (escaped) to `opc-order`, empties `env.cart` in place and returns `{billingEmail, orderId}`.
    A mail failure can never reach it, because it sends no mail.
  - `issueInvoice(env, invoiceXml)` publishes the invoice unchanged to the `invoice` topic. When
    `switches.invoice` is on and the invoice's `<OrderId>` is a known order, it also queues a
    "Java Pet Store Order Shipped: <id>" mail.
  - `processInvoice(env, {orderId, completesOrder})` sends the order id to
    `completed-order-mail` only when `completesOrder` is true. It does this whatever the
    switches say: the queue is the trigger.
  - `sendCompletedOrderMail(env, orderId)` consumes that queue. When `switches.completed` is on,
    it queues a "Java Pet Store Order COMPLETED: <id>" mail. This function is not in the locked
    harness. The name is fixed here.
  - `changeOrderStatus(env, orderId, status)` queues a "Java Pet Store Order Status: <id>" mail
    only when `switches.statusChange` is on and the order is known.
  - Every mail goes to the order's stored address, in its locale (`env.orders.get(id)`). The
    body is one minimal HTML line with the order id and status: body copy belongs to
    internationalisation (out of scope).
  - All three switches default to `false`.
- **P7 Locator (R-0108, R-0137).** `createLocator(lookup)` caches each resolved value by name in
  a `Map` and returns the same instance every time. A failed lookup is not cached and rejects
  with `LocatorError`, whose `cause` is the original error. It is about 25 lines and needs no
  other dependency. The brief's open question proposes the app's existing build-once pattern;
  the locked suite needs `createLocator`, so this is the smallest form of that pattern.
- **P8 App wiring.** `src/notifications/runtime.ts` exports
  `notifyOrders(db, events)`. It is best-effort: it catches and logs everything, so it never
  throws into the caller.
  - It builds a `NotifEnv` from deployment settings. The switches come from `NOTIFY_STATUS_CHANGE`,
    `NOTIFY_INVOICE` and `NOTIFY_COMPLETED`; only `"true"` enables one, so all are off by default
    (SD10).
  - `MAIL_FROM` is the default sender. The default transport rejects with "no mail server
    configured", so the mail is logged and dropped (R-0136, SD8).
  - It fills `orders` from `checkout_order` (`email_address`, `locale`) for the ids it handles.
  - It runs the matching order-flow function, then drains the `mail` queue through
    `processMailMessage`.
  - Two call sites, each placed **after** their existing outbox writes, which stay unchanged:
    - `dispatchApprovals`: every decided order → `changeOrderStatus`.
    - `dispatchFulfilment`: every invoice → `issueInvoice`; every completed order →
      `sendCompletedOrderMail`.
  - Both dispatchers drain queues that were filled only after their transactions committed, so
    nothing is announced for a change that was not saved.

### Phases (in `tasks.md` order)

1. **Documents (1.1, 1.2):** `mail-document.ts`, `order-approval.ts` (P3, P5).
2. **Mailer (2.1, 2.2):** `env.ts`, `mailer.ts` (P4).
3. **Order e-mails (3.1–3.4):** the switches in `env.ts` and `order-flow.ts` (P6).
4. **Messaging (4.1–4.3):** `broker.ts`, `sender.ts`, the rest of `order-flow.ts`, and the
   wiring in `runtime.ts` and both dispatchers (P2, P6, P8).
5. **Locator (5.1, 5.2):** `locator.ts` (P7).
6. **Test harness:**
   - A unit test beside every new module, `src/notifications/*.test.ts` (`@jest-environment
     node`).
   - A `runtime.test.ts` that shows:
     - all switches off sends nothing;
     - a switch on with the default transport logs and drops the mail, and the caller does not
       throw;
     - the existing outbox rows are unchanged.
   - The locked `tests/acceptance/order-notifications` suite passes unedited. The approval,
     fulfilment and checkout acceptance suites stay green.
   - No E2E spec: this capability has no screen.
7. **CI:** no workflow change. The existing `ci.yml` jobs already run the unit and acceptance
   suites on `vortex/**`, and adding modules under `src/` needs nothing new.

## Spec discrepancies

- **SD1 Locale vs. three-part mail request.** R-0113 needs the body in the order's locale, but
  R-0135 says a mail request has exactly three parts. C-0156 checks both. Resolved: the locale
  is an attribute on `<Mail>`, not a fourth part (P3).
- **SD2 Invoice "topic".** R-0103 (OF-REQ-0003, a key flagged above as conflicting) names an
  invoice topic. This repo already records invoices in `message_outbox` as `supplier-invoice`.
  Resolved: publish to the broker's `invoice` topic as well, and leave the outbox row unchanged.
- **SD3 Locator scope.** R-0108 lists EJB homes, JMS factories and data sources on a "web tier".
  None of those exist in a Next.js app. Resolved: a generic name-keyed cache (P7), as the brief's
  open question proposes.
- **SD4 OrderApproval 1.0 DTD.** R-0105 validates against a DTD type. The repo's approval
  documents declare no DOCTYPE. Resolved: with `validate`, the check is the root element name,
  plus the DOCTYPE when one is declared (P5).
- **SD5 Approval outcome shape.** R-0107's outcome is `<OrderStatus>` APPROVED or DENIED in this
  repo, and `approved: boolean` in the locked harness. Resolved: map one to the other (P5).
- **SD6 Checkout route vs. R-0102.** `POST /api/checkout/orders` hands the order to approval
  in-process and synchronously. It returns `{orderId}` for JSON with no billing e-mail, and
  empties the cart only for a form post. Its locked suite fixes that response, so the route is
  not changed. R-0102 is met by `submitPurchaseOrder` at library level.
- **SD7 Mailer "sends whatever it is given".** R-0189 puts the gate on the switches, not the
  mailer. That matches P4/P6: `processMailMessage` checks no switch.
- **SD8 No mail server.** R-0104 assumes a JavaMail session. The repo has no mail library or
  SMTP setting, so the production transport rejects and every mail is logged and dropped
  (R-0136). A real transport is follow-up work.
- **SD9 Legacy brand.** The subjects "Java Pet Store Order …" and X-Mailer "JavaMailer" are kept
  word for word, as the spec and locked cases require. Renaming them is an open question on the
  brief.
- **SD10 Who sets the switches.** R-0112 and R-0189 say "administrator", but the brief has no
  screen. Resolved: deployment settings (environment variables), all off by default, until the
  brief's open question is decided.
