## 1. Data model

- [ ] 1.1 Define the order process-manager status with values PENDING, APPROVED, DENIED, COMPLETED, one per order
- [ ] 1.2 Define the order-approval message structure (list of order id and status)

## 2. Automatic approval

- [ ] 2.1 Persist a received purchase order and register it PENDING before evaluating approval
- [ ] 2.2 Implement the regional limit rule (US < 500, Japan < 50000, other locales never)
- [ ] 2.3 Publish an APPROVED order-approval message only for qualifying orders

## 3. Approval processing

- [ ] 3.1 Ignore orders whose current status is not PENDING
- [ ] 3.2 Update status of PENDING orders to the decided status
- [ ] 3.3 Build and send the supplier purchase order for APPROVED orders
- [ ] 3.4 Add changed orders to the customer notification list

## 4. Administrator decisions

- [ ] 4.1 Allow changing only PENDING orders to Approved or Denied, singly or in bulk
- [ ] 4.2 Send changes only on explicit Commit and omit orders left PENDING
