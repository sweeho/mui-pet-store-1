## 1. Data model

- [ ] 1.1 Define the purchase order, order manager status and contact info records
- [ ] 1.2 Define purchase order line items with line number, quantity and shipped quantity
- [ ] 1.3 Define the inventory quantity per item and the named counters store
- [ ] 1.4 Add indexes on po_user_id, po_date and order status
- [ ] 1.5 Add the line quantity and stock floor constraints

## 2. Order intake and status

- [ ] 2.1 Create supplier orders with PENDING status, contact and line items
- [ ] 2.2 Implement the status lifecycle and find-by-status
- [ ] 2.3 Expose the order status view joining orders with their status
- [ ] 2.4 Default an unreadable order date to the current date
- [ ] 2.5 Implement the retention purge of supplier orders and contacts

## 3. Fulfilment

- [ ] 3.1 Fulfil each line against stock, skipping shipped lines and items without inventory
- [ ] 3.2 Set COMPLETED only when all lines are shipped
- [ ] 3.3 Process supplier invoices and set SHIPPED_PART or COMPLETED
- [ ] 3.4 Produce one invoice per processed order with shipped lines only
- [ ] 3.5 Reprocess PENDING orders after an inventory update

## 4. Documents and identifiers

- [ ] 4.1 Build and send the SupplierOrder document for approved orders
- [ ] 4.2 Issue the Invoice document
- [ ] 4.3 Validate documents on read
- [ ] 4.4 Generate sequential identifiers from named counters

## 5. Inventory screen

- [ ] 5.1 Build the inventory screen with existing quantity, new quantity and update checkbox per item
- [ ] 5.2 Apply only ticked, non-blank, non-negative quantities on submit
