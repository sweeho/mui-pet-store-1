## 1. Documents

- [ ] 1.1 Define the Mail document (address, subject, content) with structure validation
- [ ] 1.2 Define the OrderApproval document with type validation

## 2. Mailer

- [ ] 2.1 Consume mail messages and send one HTML e-mail each
- [ ] 2.2 Log and discard undeliverable or invalid mails without retry or queue failure

## 3. Order e-mails

- [ ] 3.1 Add three administrator switches defaulting to disabled
- [ ] 3.2 Send status-change e-mail with subject and purchase-order locale
- [ ] 3.3 Send shipment invoice e-mail
- [ ] 3.4 Send completed-order e-mail only when an invoice completes the order

## 4. Messaging

- [ ] 4.1 Send completed purchase order as XML asynchronously and clear cart
- [ ] 4.2 Publish generated invoices to the invoice topic
- [ ] 4.3 Implement async sender within the caller's transaction

## 5. Locator

- [ ] 5.1 Implement shared caching resource locator
- [ ] 5.2 Wrap lookup failures in a single locator error
