# Legacy implementation notes: order-fulfilment

## Where the behaviour lived
- Supplier purchase orders: EJB 2.0 CMP entity `SupplierOrderEJB` (`app/src/components/supplierpo`). Status is hard-coded PENDING in `ejbCreate`. The "at least one line item" rule is enforced only by the `SupplierOrder.dtd` (`LineItem+`), not by the bean.
- Order approval to supplier order: `OrderApprovalMDB` (`apps/opc`) builds the SupplierOrder XML and sends it to the supplier queue; denied orders produce none.
- Invoice handling: `InvoiceMDB` (`apps/opc`) marks lines shipped and sets COMPLETED or SHIPPED_PART, triggering the completed-order mail.
- Fulfilment against stock and invoice generation: supplier application (`apps/supplier`), reprocessing PENDING orders after a stock update.
- Inventory screen: `displayinventory.jsp` with `DisplayInventoryBean`; inputs are named `qty_<itemId>` and `item_<itemId>`; the update only applies to ticked items. Supplier actions are restricted by `web.xml` to the administrator role with form login, though a servlet comment expects a "supplier" user.
- Identifier counters: `uidgen` component, table of named integer counters.
- Schema: `purchase_order` indexed on `po_user_id` and `po_date`; `order_manager` indexed on `status`; constraints on line quantity and stock floor.

## Known conflicts and flags
- Status vocabulary differs between records: four statuses (PENDING, APPROVED, DENIED, COMPLETED), five (adds SHIPPED_PART) and a schema check allowing only PENDING or COMPLETED. See recommendations for `ORDER-FULFILMENT-BR-0002` and `FULFIL-RULE-0002`.
- Purchase order and line item operations carry no role check at component level; recorded as found, not endorsed.
- A stored purchase order presents shipping address identical to billing address.
- Thresholds and transaction attributes were not read exhaustively; the screen record has medium confidence (JSP read, bean not read in full).

## Sprint planning (SWHM2-S-0007)

Planned on SWHM2-T-0032. One FEATURE owns every line of `tasks.md`. The locked
`tests/acceptance/order-fulfilment/harness.ts` is the interface contract: it names the modules,
functions, tables and routes. This section says how to meet it in this codebase.

### Codebase findings

- **Order processing exists from order approval** (`src/approval/`, migration `drizzle/0005_*`):
  - `purchase_order`, `order_manager` and `order_line` exist, with NUMERIC-affinity order ids.
  - `order_line` has no `quantity_shipped` and no CHECK.
  - Neither `purchase_order` nor `order_manager` has an index.
  - `ORDER_STATUSES` in `src/approval/orders.ts` holds four values. Its tests are locked; leave
    it alone.
- **Approval already builds the supplier order.** `processApprovalMessage` (`src/approval/handler.ts`)
  pushes `buildSupplierOrderXml` (`src/approval/supplier.ts`) onto `env.supplierQueue`.
  `dispatchApprovals` (`src/approval/dispatch.ts`) records it in `message_outbox`, queue
  `supplier-purchase-order`. Nothing consumes it yet. That XML's `<ShippingInfo>` carries
  `Name, Street1, Street2, City, State, Zip, Country` and no e-mail or phone.
- **Tables that do not exist yet:** `supplier_order`, `supplier_order_line`, `contact_info`,
  `inventory`, `counter`, `order_status` and the view `v_order_status`. Checkout's `sequence`
  table is a different counter store (`src/checkout/ids.ts`).
- **Other locked suites share these tables.**
  - `batch-operations` inserts `contact_info(order_id, email)`, `inventory(item_id, quantity)` and
    `order_line(order_id, line_num, item_id, quantity)` with no other columns.
  - `admin-order-management` reads the view `v_order_status`, an inner join of `purchase_order`
    and `order_manager`.
- **Foreign keys are off in the app.** `getDb()` sets no `PRAGMA foreign_keys`, but the
  fulfilment harness turns it on. The purge and create order must therefore be FK-safe.
- **The catalog seeds itself.** `getDb()` (`src/db/client.ts`) calls `populateCatalog` when `item`
  is empty. There is no inventory data anywhere.
- **The inventory route and navigation entry already exist.**
  - `/admin/inventory` is a placeholder (`src/app/(DashboardLayout)/admin/inventory/page.tsx`).
  - `src/shell/menu.ts` already lists it under Operations.
  - `requireAdmin()` (`src/admin/session.ts`) redirects on the server, so locked navigation case
    C-0226 still lands on a page inside the shell (`/admin/login`).
- **XML is hand-written.** `src/checkout/documents.ts` and `src/approval/documents.ts` read and
  write XML with no parser dependency.

### Decisions

- **P1 Migration `drizzle/0006_*`.** All in `src/db/schema.ts`, generated and committed:
  - `contact_info(contact_id integer PK autoincrement, order_id text, name, address, email, phone)`.
    Every column but the key is nullable, because batch inserts only `order_id, email`.
  - `supplier_order(order_id text PK, order_date integer NOT NULL (epoch ms), status text NOT NULL,
    contact_id integer NOT NULL REFERENCES contact_info)`. Ids are text: they arrive in XML.
  - `supplier_order_line(order_id, line_num, category_id, product_id, item_id NOT NULL,
    quantity integer NOT NULL CHECK (quantity > 0), unit_price real,
    quantity_shipped integer NOT NULL DEFAULT 0 CHECK (quantity_shipped <= quantity),
    PK(order_id, line_num))`.
  - `order_line` gains `quantity_shipped integer NOT NULL DEFAULT 0` and the same two CHECKs. The
    rebuild must keep existing rows.
  - `inventory(item_id text PK, quantity integer NOT NULL CHECK (quantity >= 0))`.
  - `counter(name text PK, value integer NOT NULL CHECK (typeof(value) = 'integer'))`. The CHECK
    is needed because C-0183 inserts `1.5` and `'abc'`.
  - `order_status(order_id PK, status text NOT NULL CHECK (length(status) <= 20))`.
  - Indexes on `purchase_order(user_name)`, `purchase_order(order_time)` and
    `order_manager(status)`.
  - View `v_order_status`: `purchase_order` inner join `order_manager`, giving id, user, date,
    total and status. Use a custom migration file if drizzle-kit cannot emit the view.
    Admin-order-management reads the same view.
- **P2 `FulfilEnv`** (`src/fulfilment/env.ts`) mirrors `ApprovalEnv`:
  - `db`, `now`, `supplierQueue`, `completedOrderQueue` and `invoiceQueue` (in-memory arrays)
  - optional `onReprocess(orderId)`, `invoiceGeneration.fail` and `counterCreation.fail` test hooks
  - `callerRole`, which is never checked (R-0187, R-0182, R-0099)
  - `newFulfilEnv(db)` builds one with empty arrays.
- **P3 Statuses.** `src/fulfilment/orders.ts` has its own five-value `ORDER_STATUSES`, checked in
  code with no DB CHECK on `supplier_order.status` (SD1). Every status write goes through one
  helper, which also upserts `order_status`. When a supplier order becomes COMPLETED:
  - its id goes on `completedOrderQueue`
  - the customer order with the same id, if `purchase_order` has one, records COMPLETED through
    `recordOrderStatus` in `src/approval/orders.ts`.
- **P4 Fulfilment** (`src/fulfilment/fulfilment.ts`). A line ships whole or not at all.
  - **`fulfilLine`:**
    - A line whose `quantity_shipped = quantity` is skipped, and stock is not touched.
    - Otherwise run a conditional `UPDATE inventory SET quantity = quantity - q WHERE item_id = ?
      AND quantity >= q`. If no row changed, the line is not shipped. That covers too little stock
      and a missing inventory row.
    - If a row changed, set `quantity_shipped = quantity`.
  - **`processOrder`:**
    - Calls `fulfilLine` for each unshipped line.
    - If at least one line shipped this run, builds one Invoice of those lines.
    - All of it runs in one transaction, so an invoice failure undoes the run's stock and line
      writes and returns `{ invoice: null }` (R-0084).
    - When every line has shipped, the order becomes COMPLETED (P3). Otherwise its status stays as
      it was, PENDING for a received order (R-0026, SD2).
    - The invoice text goes on `invoiceQueue`.
  - **`receiveSupplierOrder`:** parses, creates the order PENDING, then calls `processOrder`.
- **P5 `processInvoice`** is the path for an invoice received from elsewhere (R-0018, R-0183).
  - It adds each named line's shipped quantity.
  - When every line is then shipped, the order becomes COMPLETED (P3). Otherwise it becomes
    SHIPPED_PART.
  - `processOrder` never calls it, because its own lines are already marked shipped (SD2).
- **P6 Wiring into the product.** Add `dispatchFulfilment(env)` in `src/fulfilment/dispatch.ts`.
  - **What it does:** it runs `receiveSupplierOrder` for each supplier purchase-order message, then
    records the results in `message_outbox`. Invoices go to queue `supplier-invoice`; completed
    order ids go to queue `completed-order`, which order notifications will consume.
  - **Where it is called:** `dispatchApprovals` hands each supplier message to it after recording
    the message. The new supplier route calls it too.
  - **Shipping info:** `parseSupplierOrderMessage` reads either `<Address>` or approval's
    `Street1…Country`, joined into one address line (SD10).
- **P7 Documents** (`src/fulfilment/documents.ts`). All functions are sync and pure:
  - `buildSupplierOrderXml(order)`: the date as yyyy-MM-dd in local time, matching C-0204.
  - `buildInvoiceXml`.
  - `toLineItem`: drops `quantityShipped`.
  - `parseDocument(xml, { validate: true })`: checks the root and the element content models of an
    internal DTD subset (sequence, choice, `? * +` and `#PCDATA`). A document without a DOCTYPE
    gets no DTD check. No new dependency (SD4).
  - `processApproval(env, decisions)` in `fulfilment.ts` builds each approved order from
    `purchase_order`/`order_line`/`checkout_order` when the rows exist, otherwise from the id
    alone. It pushes onto `supplierQueue`; denied orders push nothing (R-0101).
- **P8 Identifiers** (`src/fulfilment/uidgen.ts`):
  - `nextId(env, prefix)` upserts the `counter` row named `prefix`, increments it and returns
    `prefix + value`.
  - It throws when the row cannot be created, or when `counterCreation.fail` is set.
  - Checkout keeps its own `sequence` (SD7).
- **P9 The Inventory screen and routes.**
  - **The page:** `/admin/inventory` is a server page that calls `requireAdmin()`. It reads
    `inventory` ordered by item id and renders `src/components/fulfilment/InventoryView.tsx`.
  - **The form:**
    - It is a plain HTML `POST` to `/api/admin/inventory`, with fields `qty_<itemId>` and
      `item_<itemId>`.
    - The route answers 401 without an admin session.
    - It calls `updateInventory` and redirects 303 to `/admin/inventory?updated=<n>`, which shows
      the "Stock updated" alert.
  - **`updateInventory`:**
    - It applies only ticked rows whose value is a whole number ≥ 0, so blank, negative and
      non-integer values are ignored.
    - It then calls `onReprocess` and `processOrder` for each PENDING supplier order, and
      `dispatchFulfilment` records the results.
  - **Supplier routes** (no sign-in, R-0187; SD3):
    - `POST /api/supplier/purchase-orders` (XML body) → `receiveSupplierOrder` +
      `dispatchFulfilment`. It answers 201 `{orderId, status}`, or 400 when the document is
      invalid.
    - `GET /api/supplier/purchase-orders/[id]` → `{orderId, status}` or 404.
  - **Navigation:** the existing Operations entry stays.
- **P10 Starting inventory.**
  - `getDb()` seeds `inventory` with every catalog item at 10000 when `inventory` is empty, right
    after `populateCatalog`.
  - Batch operations owns the real inventory load (out of scope). The locked browser cases need
    rows to exist.

### Phases (in `tasks.md` order)

1. **Data model (1.1–1.5):** P1, then a schema test for each constraint.
2. **Order intake and status (2.1–2.5):** `orders.ts` (P2, P3).
3. **Fulfilment (3.1–3.5):** `fulfilment.ts` and `inventory.ts` (P4, P5).
4. **Documents and identifiers (4.1–4.4):** `documents.ts` and `uidgen.ts` (P7, P8), plus the
   wiring (P6).
5. **Inventory screen (5.1, 5.2):** the page, the view, the routes and the seed (P9, P10).
6. **Test harness:**
   - a unit test beside every new module
   - a route test beside every new route
   - a component test for `InventoryView`
   - `e2e/inventory.spec.ts`: sign in, change one ticked row, see the new quantity
   - the checkout route test extended: an approved order reaches the supplier, and with stock it
     becomes COMPLETED.

   The locked order-fulfilment suites must pass unedited. The order-approval, checkout,
   site-shell and other suites keep passing.
7. **CI:** no workflow change is expected. The existing workflow already runs on `vortex/**`
   pushes and pull requests. The new migration and the e2e spec run in the existing jobs. If a
   job needs a change, it is part of this phase.

## Spec discrepancies

Recorded here, not edited into the delta spec. Also posted on SWHM2-T-0032.

- **SD1 Status sets disagree.**
  - The PRD has four statuses. R-0091 and R-0093 have five, adding SHIPPED_PART.
  - R-0081 keeps a supplier order at PENDING or COMPLETED only, yet locked cases C-0198, C-0201
    and C-0182 set a supplier order APPROVED.
  - The build follows the locked cases: five values checked in code, no status CHECK in the
    database. Only the stock-floor half of R-0081 is enforced.
  - Approval's four-value set is unchanged. Open question Q1 is for the Business Owner.
- **SD2 SHIPPED_PART vs "reprocess only PENDING".**
  - R-0018 sets SHIPPED_PART on a partial invoice. R-0085 reprocesses only PENDING orders, and
    R-0026 keeps a partly fulfilled order PENDING.
  - If our own fulfilment set SHIPPED_PART, a partly shipped order would never be retried. So
    `processOrder` leaves it PENDING (P4), and only `processInvoice` sets SHIPPED_PART (P5).
- **SD3 Who may use the inventory and supplier operations (Q2).**
  - R-0187 and R-0182 say no role check. The locked browser cases sign in at `/admin/login`
    before opening `/admin/inventory`, so the page and its POST sit behind the admin session.
  - The supplier routes stay open, because C-0211 posts without a session. That is a security
    point for the Business Owner before release: anyone who can reach the app can post a supplier
    order.
- **SD4 Validating parse (Q3).** R-0100 rejects a document that breaks its DTD. There is no XML
  validator in the stack, and C-0208 uses an internal DTD subset. The build checks internal-subset
  content models only, does not resolve external DTDs, and checks supplier orders structurally
  (R-0092).
- **SD5 The mockup and the locked browser cases.**
  - MCK-49/50 disable Update inventory when nothing is ticked. C-0195 clicks it with nothing
    ticked, so the button stays enabled and the "N items will change" line still shows.
  - The mockup prints quantities with thousands separators (`10,000`). C-0195 and C-0211 read the
    second cell with `parseInt`, so existing quantities are plain integers.
- **SD6 Mockup shell.** The mockups draw their own shell. The app's shell decides, as in earlier
  sprints.
- **SD7 Two counter stores.** R-0024 and C-0183 need a `counter` table. Checkout already issues
  ids from `sequence`. Both stay; merging them would edit checkout's locked contract.
- **SD8 Shipping equals billing (R-0094).** This is a legacy quirk kept as specified: a purchase
  order stores one contact, and `getPurchaseOrder` returns it as both.
- **SD9 Purge "addresses" (R-0177).** A supplier order's address is a column of its
  `contact_info` row, so deleting the order's lines, the order and its contact removes it.
  Scheduling the purge belongs to batch operations.
- **SD10 Two supplier-order shapes.** Approval's XML has no e-mail or phone and splits the
  address. The parser accepts both shapes, and approval's builder is unchanged because its tests
  are locked.
- **SD11 Two status stores.** R-0011 wants one status per order, and `order_manager` (approval's)
  has no key. `order_status` is added with a key as the harness specifies, and is kept current
  for supplier orders (P3).
