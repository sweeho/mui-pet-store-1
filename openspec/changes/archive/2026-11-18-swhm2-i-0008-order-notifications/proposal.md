# Proposal: order-notifications (recovered from legacy Java Pet Store)

## Why
Recover the behaviour by which the store tells customers and the order processing centre about orders: status, shipment and completion e-mails, the asynchronous mail queue, the mailer, and the XML documents exchanged.

## What changes
Adds a recovered specification of 17 requirements covering the three order e-mails and their switches, the mail document, mail delivery and failure handling, order submission to the processing centre, invoice publication, and the shared locator and async sender plumbing.

## Impact
No screens. Behaviour only; target design is left to the Architect.
