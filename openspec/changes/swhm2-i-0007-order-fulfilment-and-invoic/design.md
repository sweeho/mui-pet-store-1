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
