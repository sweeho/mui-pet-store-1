## 1. Documents

- [ ] 1.1 Define the Mail document (address, subject, content) with structure validation (SWHM2-T-0037; SWHM2-R-0190, SWHM2-R-0135)
- [ ] 1.2 Define the OrderApproval document with type validation (SWHM2-T-0037; SWHM2-R-0105, SWHM2-R-0107)

## 2. Mailer

- [ ] 2.1 Consume mail messages and send one HTML e-mail each (SWHM2-T-0037; SWHM2-R-0104)
- [ ] 2.2 Log and discard undeliverable or invalid mails without retry or queue failure (SWHM2-T-0037; SWHM2-R-0106, SWHM2-R-0136)

## 3. Order e-mails

- [ ] 3.1 Add three administrator switches defaulting to disabled (SWHM2-T-0037; SWHM2-R-0112, SWHM2-R-0189)
- [ ] 3.2 Send status-change e-mail with subject and purchase-order locale (SWHM2-T-0037; SWHM2-R-0113, SWHM2-R-0189)
- [ ] 3.3 Send shipment invoice e-mail (SWHM2-T-0037; SWHM2-R-0113)
- [ ] 3.4 Send completed-order e-mail only when an invoice completes the order (SWHM2-T-0037; SWHM2-R-0111, SWHM2-R-0113)

## 4. Messaging

- [ ] 4.1 Send completed purchase order as XML asynchronously and clear cart (SWHM2-T-0037; SWHM2-R-0102)
- [ ] 4.2 Publish generated invoices to the invoice topic (SWHM2-T-0037; SWHM2-R-0103)
- [ ] 4.3 Implement async sender within the caller's transaction (SWHM2-T-0037; SWHM2-R-0109, SWHM2-R-0110)

## 5. Locator

- [ ] 5.1 Implement shared caching resource locator (SWHM2-T-0037; SWHM2-R-0108)
- [ ] 5.2 Wrap lookup failures in a single locator error (SWHM2-T-0037; SWHM2-R-0137)
