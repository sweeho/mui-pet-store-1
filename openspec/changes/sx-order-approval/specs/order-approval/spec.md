## ADDED Requirements

### Requirement: Automatic approval limits
ID: SWHM2-R-0174
Recovered from: order-approval-RULE-0001

The system SHALL automatically approve a newly received purchase order whose locale is US when its total price is strictly less than 500, and whose locale is Japan when its total price is strictly less than 50000.

#### Scenario: US order under the limit
- **GIVEN** a received US purchase order with total 499
- **WHEN** it is evaluated
- **THEN** it is approved automatically

#### Scenario: US order at the limit
- **GIVEN** a received US purchase order with total 500
- **WHEN** it is evaluated
- **THEN** it is not approved automatically

### Requirement: Other locales are not auto-approved
ID: SWHM2-R-0175
Recovered from: order-approval-RULE-0002

GIVEN a purchase order whose locale is neither US nor Japan, WHEN it is received, THEN the system SHALL NOT approve it automatically and SHALL leave it PENDING for administrator decision.

#### Scenario: Unsupported locale
- **GIVEN** a purchase order with a locale other than US or Japan and a total of 10
- **WHEN** it is received
- **THEN** it stays PENDING

### Requirement: Orders held for an administrator
ID: SWHM2-R-0171
Recovered from: ORDAPP-RULE-0002

GIVEN a purchase order whose locale is neither US nor Japan, or whose total is at or above the regional limit, WHEN it is received, THEN the system SHALL leave it in PENDING status and wait for an administrator, without sending any approval message.

#### Scenario: Japan order at the limit
- **GIVEN** a Japan purchase order with total 50000
- **WHEN** it is received
- **THEN** it is PENDING and no approval message is sent

### Requirement: Receive purchase order workflow
ID: SWHM2-R-0079
Recovered from: order-approval-WF-0001

The system SHALL, on receiving a purchase order message, persist the purchase order, register it with the process manager in status PENDING, and, only if it qualifies for automatic approval, publish an approval of that order (status APPROVED) to the order-approval queue; otherwise it SHALL publish nothing and wait for an administrator.

#### Scenario: Qualifying order
- **GIVEN** a purchase order that qualifies for automatic approval
- **WHEN** the message is received
- **THEN** the order is stored, registered PENDING, and an APPROVED approval is published

#### Scenario: Non-qualifying order
- **GIVEN** a purchase order that does not qualify
- **WHEN** the message is received
- **THEN** the order is stored and registered PENDING and nothing is published

### Requirement: Automatic decision follows the approval queue
ID: SWHM2-R-0078
Recovered from: order-approval-REQ-0004

The system SHALL forward an automatic approval decision to the order-approval queue as an order-approval message so that it follows the same path as an administrator decision.

#### Scenario: Auto decision queued
- **GIVEN** an order approved automatically
- **WHEN** the decision is forwarded
- **THEN** an order-approval message for it is on the order-approval queue

### Requirement: Approval message processing
ID: SWHM2-R-0130
Recovered from: order-approval-WF-0002

The system SHALL, for each PENDING order in an incoming approval message, record the new status in the process manager, and for each order whose new status is APPROVED SHALL build a supplier purchase order (order id, date, ship-to contact and address, and every line item with category, product, item, line number, quantity and unit price) and send it to the supplier purchase-order queue.

#### Scenario: Approved order
- **GIVEN** a PENDING order with two line items
- **WHEN** a message approves it
- **THEN** its status is APPROVED and a supplier purchase order with both lines is sent

#### Scenario: Denied order
- **GIVEN** a PENDING order
- **WHEN** a message denies it
- **THEN** its status is DENIED and no supplier purchase order is sent

### Requirement: Status update and customer notification
ID: SWHM2-R-0173
Recovered from: order-approval-REQ-0006

The system SHALL, for each PENDING order in an approval message, update the order status to the decided status (APPROVED or DENIED) and include the order in the list of status changes to notify the customer about.

#### Scenario: Changed order notified
- **GIVEN** a PENDING order in an approval message
- **WHEN** the message is processed
- **THEN** the status is updated and the order is in the customer notification list

### Requirement: Ignore non-PENDING orders in messages
ID: SWHM2-R-0172
Recovered from: order-approval-REQ-0005

GIVEN an order-approval message naming an order whose current status is not PENDING, WHEN it is processed, THEN the system SHALL ignore that order: no status change, no supplier purchase order and no customer notification for it.

#### Scenario: Already approved order
- **GIVEN** an order with status APPROVED
- **WHEN** a message denies it
- **THEN** its status remains APPROVED and nothing is sent

### Requirement: Ignore non-PENDING status changes
ID: SWHM2-R-0176
Recovered from: order-approval-RULE-0003

GIVEN an order status change (approve or deny) arrives for an order whose current status is not PENDING, WHEN the change is processed, THEN the system SHALL ignore that order: no status update, no supplier purchase order and no customer notification entry.

#### Scenario: Completed order
- **GIVEN** an order with status COMPLETED
- **WHEN** an approve change arrives
- **THEN** the order is ignored

### Requirement: Order status values
ID: SWHM2-R-0077
Recovered from: APPR-ENT-0001

The system SHALL record, for each order, a process-manager status that is exactly one of PENDING, APPROVED, DENIED or COMPLETED.

#### Scenario: Valid status
- **GIVEN** an order
- **WHEN** its status is recorded
- **THEN** it is one of PENDING, APPROVED, DENIED or COMPLETED

### Requirement: Administrator commit workflow
ID: SWHM2-R-0169
Recovered from: ADM-WFL-0002

The system SHALL let an administrator change pending orders to APPROVED or DENIED, singly or in bulk, and send the changes on an explicit Commit action; orders left PENDING are not sent.

#### Scenario: Bulk commit
- **GIVEN** three PENDING orders of which two are marked Approved
- **WHEN** the administrator presses Commit
- **THEN** only the two changed orders are sent

### Requirement: Only PENDING orders are changeable
ID: SWHM2-R-0170
Recovered from: ADMIN-REQ-0004

The system SHALL let an administrator change only PENDING orders, choosing Approved or Denied per order or for several selected orders at once, with the changes held locally until the administrator presses Commit.

#### Scenario: Non-pending order
- **GIVEN** an order with status APPROVED
- **WHEN** the administrator views the orders
- **THEN** its status cannot be changed

#### Scenario: Changes held until Commit
- **GIVEN** an administrator who has chosen Denied for a PENDING order
- **WHEN** Commit has not been pressed
- **THEN** nothing has been sent
