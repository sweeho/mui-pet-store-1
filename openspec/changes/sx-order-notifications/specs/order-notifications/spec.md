## ADDED Requirements

### Requirement: Status e-mail gated by administrator
ID: SWHM2-R-0189
Recovered from: ONOT-REQ-0005

The system SHALL NOT send status e-mail when notifications are not enabled by the administrator, and the mailer itself SHALL send whatever it is given.

#### Scenario: Notifications disabled
- **GIVEN** notifications are not enabled
- **WHEN** an order changes status
- **THEN** no status e-mail is sent

### Requirement: Mail XML document
ID: SWHM2-R-0190
Recovered from: ORDN-INT-0006

The system SHALL represent a notification mail as a Mail XML document with an Address, a Subject and a Content, all text.

#### Scenario: Mail document built
- **GIVEN** a notification to send
- **WHEN** the mail document is produced
- **THEN** it carries Address, Subject and Content as text

### Requirement: Purchase order submission
ID: SWHM2-R-0102
Recovered from: NOTIF-REQ-0001

The system SHALL send a completed purchase order, as an XML message, asynchronously to the order processing center, and SHALL empty the shopping cart and return the billing email and order id to the shopper afterwards.

#### Scenario: Order submitted
- **GIVEN** a completed purchase order
- **WHEN** it is submitted
- **THEN** the XML message is sent asynchronously, the cart is emptied, and billing e-mail and order id are returned

### Requirement: Invoice publication
ID: SWHM2-R-0103
Recovered from: OF-REQ-0003

The system SHALL publish each generated invoice document to the invoice topic so the order processing centre can mark the order fulfilled.

#### Scenario: Invoice generated
- **GIVEN** a generated invoice document
- **WHEN** it is issued
- **THEN** it is published to the invoice topic

### Requirement: Mail message format
ID: SWHM2-R-0104
Recovered from: ONOT-RULE-0002

The system SHALL send the mail body as HTML, with the sender taken from the mail session default, recipients parsed from the address field non-strictly so several addresses are allowed, the subject as given, the current date as sent date and an X-Mailer header of "JavaMailer".

#### Scenario: Mail with several recipients
- **GIVEN** a mail request whose address lists two recipients
- **WHEN** the mailer sends it
- **THEN** an HTML message goes to both with the default sender, current sent date and X-Mailer "JavaMailer"

### Requirement: OrderApproval document validation
ID: SWHM2-R-0105
Recovered from: ORDN-BR-0002

The system SHALL reject an incoming OrderApproval document, parsed with validation enabled, whose document type is not the OrderApproval 1.0 type or which is otherwise invalid.

#### Scenario: Wrong document type
- **GIVEN** validation is enabled
- **WHEN** a document of another type is parsed
- **THEN** it is rejected with an error

### Requirement: Invalid mail request handling
ID: SWHM2-R-0106
Recovered from: ORDN-BR-0004

The system SHALL raise an error when a queued mail request is not a valid mail document or cannot be read.

#### Scenario: Malformed mail request
- **GIVEN** a queued message that is not a valid mail document
- **WHEN** the mailer processes it
- **THEN** an error is raised

### Requirement: OrderApproval exchange
ID: SWHM2-R-0107
Recovered from: ORDN-INT-0001

The system SHALL exchange order approval outcomes as an OrderApproval XML document containing one or more Order entries, each with an order identifier and its approval outcome.

#### Scenario: Approval outcomes exchanged
- **GIVEN** several approved or rejected orders
- **WHEN** outcomes are sent
- **THEN** one OrderApproval document with one Order entry per order is produced

### Requirement: Shared resource locator
ID: SWHM2-R-0108
Recovered from: ORDN-REQ-0002

The system SHALL, on the web tier, provide a single shared locator instance that caches resolved homes, queues, queue and topic connection factories, topics and data sources by name so each name is looked up only once.

#### Scenario: Repeated lookup
- **GIVEN** a queue already resolved by name
- **WHEN** it is requested again
- **THEN** the cached instance is returned without a new lookup

### Requirement: Transactional message sending
ID: SWHM2-R-0109
Recovered from: ORDNOT-BUSINESS-RULE-0003

The system SHALL send the message as part of the caller's transaction, so that it is only delivered if the surrounding business transaction commits.

#### Scenario: Transaction rolls back
- **GIVEN** a message sent inside a business transaction
- **WHEN** the transaction rolls back
- **THEN** the message is not delivered

### Requirement: Async sender queue
ID: SWHM2-R-0110
Recovered from: ORDNOT-WORKFLOW-0001

The system SHALL accept a text message from a calling component and place it, as a single text message, on the asynchronous sender queue for later processing by a separate consumer.

#### Scenario: Message queued
- **GIVEN** a calling component with a text message
- **WHEN** it sends the message
- **THEN** one text message is placed on the queue

### Requirement: Completed-order mail trigger
ID: SWHM2-R-0111
Recovered from: order-notifications-REQ-0003

The system SHALL, when an invoice completes an order, send the order id to the completed-order mail queue, and partially shipped orders SHALL NOT trigger that message.

#### Scenario: Order completed
- **GIVEN** an invoice that completes the order
- **WHEN** it is processed
- **THEN** the order id is sent to the completed-order mail queue

#### Scenario: Partial shipment
- **GIVEN** an invoice for a partially shipped order
- **WHEN** it is processed
- **THEN** no completed-order message is sent

### Requirement: Order e-mail switches
ID: SWHM2-R-0112
Recovered from: order-notifications-RULE-0001

The system SHALL send each of the three order e-mails (status change, shipment invoice, order completed) only when its own switch is enabled, and all three switches SHALL default to disabled.

#### Scenario: Default configuration
- **GIVEN** no switch has been changed
- **WHEN** an order changes status
- **THEN** no e-mail is sent

### Requirement: Order e-mail addressing and subjects
ID: SWHM2-R-0113
Recovered from: order-notifications-RULE-0002

The system SHALL address each order e-mail to the e-mail address on the purchase order, render its body in the locale on the purchase order, and use the subject "Java Pet Store Order Status: <order id>" for status changes, "Java Pet Store Order Shipped: <order id>" for invoices and "Java Pet Store Order COMPLETED: <order id>" for completion.

#### Scenario: Status change e-mail
- **GIVEN** the status switch is enabled and order 42 has a stored address and locale
- **WHEN** its status changes
- **THEN** an e-mail with subject "Java Pet Store Order Status: 42" goes to that address in that locale

### Requirement: Mail request structure
ID: SWHM2-R-0135
Recovered from: ONOT-ENT-0004

The system SHALL represent a mail request as a document with exactly three text parts in order: address, subject, content, and SHALL validate incoming requests against that structure.

#### Scenario: Wrong structure
- **GIVEN** a request with parts out of order or missing
- **WHEN** it is validated
- **THEN** it is rejected

### Requirement: Undeliverable mail discarded
ID: SWHM2-R-0136
Recovered from: ORDN-BR-0003

The system SHALL discard a mail request that cannot be delivered (mail server missing or send failure) silently, without retry and without failing the order flow.

#### Scenario: Send failure
- **GIVEN** the mail server is unreachable
- **WHEN** the mailer processes a request
- **THEN** the request is discarded, not retried, and the order flow is unaffected

### Requirement: Locator error wrapping
ID: SWHM2-R-0137
Recovered from: ORDN-REQ-0003

The system SHALL, when a lookup fails for any reason, raise a single locator error that wraps the underlying cause.

#### Scenario: Lookup fails
- **GIVEN** a name that cannot be resolved
- **WHEN** the locator is asked for it
- **THEN** a locator error wrapping the cause is raised
