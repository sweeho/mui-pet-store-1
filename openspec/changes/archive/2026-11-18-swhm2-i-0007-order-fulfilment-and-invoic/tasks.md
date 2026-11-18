## 1. Data model

- [x] 1.1 Define the purchase order, order manager status and contact info records (SWHM2-T-0033; SWHM2-R-0016, SWHM2-R-0011, SWHM2-R-0134, SWHM2-R-0095)
- [x] 1.2 Define purchase order line items with line number, quantity and shipped quantity (SWHM2-T-0033; SWHM2-R-0030, SWHM2-R-0181, SWHM2-R-0188)
- [x] 1.3 Define the inventory quantity per item and the named counters store (SWHM2-T-0033; SWHM2-R-0025, SWHM2-R-0024)
- [x] 1.4 Add indexes on po_user_id, po_date and order status (SWHM2-T-0033; SWHM2-R-0012, SWHM2-R-0013, SWHM2-R-0014)
- [x] 1.5 Add the line quantity and stock floor constraints (SWHM2-T-0033; SWHM2-R-0080, SWHM2-R-0081)

## 2. Order intake and status

- [x] 2.1 Create supplier orders with PENDING status, contact and line items (SWHM2-T-0033; SWHM2-R-0088, SWHM2-R-0089, SWHM2-R-0092, SWHM2-R-0186, SWHM2-R-0187, SWHM2-R-0094, SWHM2-R-0097, SWHM2-R-0182)
- [x] 2.2 Implement the status lifecycle and find-by-status (SWHM2-T-0033; SWHM2-R-0091, SWHM2-R-0093, SWHM2-R-0090)
- [x] 2.3 Expose the order status view joining orders with their status (SWHM2-T-0033; SWHM2-R-0017)
- [x] 2.4 Default an unreadable order date to the current date (SWHM2-T-0033; SWHM2-R-0178)
- [x] 2.5 Implement the retention purge of supplier orders and contacts (SWHM2-T-0033; SWHM2-R-0177)

## 3. Fulfilment

- [x] 3.1 Fulfil each line against stock, skipping shipped lines and items without inventory (SWHM2-T-0033; SWHM2-R-0031, SWHM2-R-0180, SWHM2-R-0082, SWHM2-R-0083, SWHM2-R-0131)
- [x] 3.2 Set COMPLETED only when all lines are shipped (SWHM2-T-0033; SWHM2-R-0026)
- [x] 3.3 Process supplier invoices and set SHIPPED_PART or COMPLETED (SWHM2-T-0033; SWHM2-R-0018, SWHM2-R-0183)
- [x] 3.4 Produce one invoice per processed order with shipped lines only (SWHM2-T-0033; SWHM2-R-0179, SWHM2-R-0084)
- [x] 3.5 Reprocess PENDING orders after an inventory update (SWHM2-T-0033; SWHM2-R-0085, SWHM2-R-0132)

## 4. Documents and identifiers

- [x] 4.1 Build and send the SupplierOrder document for approved orders (SWHM2-T-0033; SWHM2-R-0101, SWHM2-R-0096)
- [x] 4.2 Issue the Invoice document (SWHM2-T-0033; SWHM2-R-0185, SWHM2-R-0184)
- [x] 4.3 Validate documents on read (SWHM2-T-0033; SWHM2-R-0100)
- [x] 4.4 Generate sequential identifiers from named counters (SWHM2-T-0033; SWHM2-R-0098, SWHM2-R-0099)

## 5. Inventory screen

- [x] 5.1 Build the inventory screen with existing quantity, new quantity and update checkbox per item (SWHM2-T-0033; SWHM2-R-0015)
- [x] 5.2 Apply only ticked, non-blank, non-negative quantities on submit (SWHM2-T-0033; SWHM2-R-0086, SWHM2-R-0087)
