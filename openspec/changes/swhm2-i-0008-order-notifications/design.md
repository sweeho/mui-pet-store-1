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
