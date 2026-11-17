## ADDED Requirements

### Requirement: Unreadable order date defaults to today
Recovered from: ORDER-FULFILMENT-BR-0005
GIVEN an incoming supplier purchase order whose date cannot be read WHEN it is parsed THEN the system SHALL use the current date as the order date.

#### Scenario: Unreadable order date defaults to today
- **GIVEN** an incoming supplier purchase order with an unparseable date
- **WHEN** the order is parsed
- **THEN** the current date is used as the order date

### Requirement: Retention purge removes supplier orders
Recovered from: ORDER-FULFILMENT-BR-0006
The system SHALL delete supplier purchase orders together with their contact information and addresses when the order retention purge removes them.

#### Scenario: Retention purge removes supplier orders
- **GIVEN** a supplier purchase order selected by the retention purge
- **WHEN** the purge runs
- **THEN** the order, its contact information and addresses are deleted

### Requirement: Purchase order line record
Recovered from: FULFIL-ENT-0001
The system SHALL store each purchase order line with a mandatory line number unique within the purchase order, category, product, item, quantity and unit price.

#### Scenario: Purchase order line record
- **GIVEN** a purchase order with two lines
- **WHEN** the lines are stored
- **THEN** each has a distinct line number within the order and carries category, product, item, quantity and unit price

### Requirement: Invoice per processed order
Recovered from: OF-REQ-0002
The system SHALL produce one invoice document per processed purchase order that lists only the lines shipped in this run, carrying order identification and shipping details.

#### Scenario: Invoice per processed order
- **GIVEN** an order of which two of three lines ship in this run
- **WHEN** the order is processed
- **THEN** one invoice is produced listing only the two shipped lines

### Requirement: Insufficient stock blocks a line
Recovered from: OF-RULE-0001
GIVEN a purchase order line whose ordered quantity exceeds the stock held for its item, WHEN fulfilment is attempted, THEN the system SHALL treat the line as not fulfilled and leave the stock unchanged.

#### Scenario: Insufficient stock blocks a line
- **GIVEN** a line ordering 10 of an item with stock 4
- **WHEN** fulfilment is attempted
- **THEN** the line is not fulfilled and stock remains 4

### Requirement: Sufficient stock is reduced
Recovered from: OF-RULE-0002
GIVEN a purchase order line with sufficient stock, WHEN fulfilment is attempted, THEN the system SHALL reduce the item's stock by the line quantity and mark the line shipped.

#### Scenario: Sufficient stock is reduced
- **GIVEN** a line ordering 3 of an item with stock 10
- **WHEN** fulfilment is attempted
- **THEN** stock becomes 7 and the line is shipped

### Requirement: Supplier order line items
Recovered from: ORDER-FULFILMENT-ENT-0002
The system SHALL record supplier order line items keyed by order id and line number, each with category, product, item, quantity, unit price and shipped quantity.

#### Scenario: Supplier order line items
- **GIVEN** a supplier order with line items
- **WHEN** they are recorded
- **THEN** each is keyed by order id and line number with its category, product, item, quantity and unit price

### Requirement: Invoice adds shipped quantity
Recovered from: ORDER-FULFILMENT-RULE-0001
WHEN a supplier invoice is processed for a purchase order, the system SHALL add the shipped quantity to the quantity shipped of each line it names.

#### Scenario: Invoice adds shipped quantity
- **GIVEN** an invoice naming a line with 2 already shipped and 3 shipped now
- **WHEN** the invoice is processed
- **THEN** the line's quantity shipped is 5

### Requirement: Order line item representation
Recovered from: ORDF-ENT-0005
The system SHALL represent each order line item in supplier orders and invoices with a category id, product id, item id, line number, quantity and unit price.

#### Scenario: Order line item representation
- **GIVEN** a line item in an order or invoice
- **WHEN** it is represented
- **THEN** it carries category id, product id, item id, line number, quantity and unit price

### Requirement: Invoice XML document
Recovered from: ORDF-INT-0004
The system SHALL issue an Invoice XML document containing the order id, user id, order date, shipping date and one or more line items.

#### Scenario: Invoice XML document
- **GIVEN** a processed order
- **WHEN** the invoice is issued
- **THEN** the XML holds order id, user id, order date, shipping date and at least one line item

### Requirement: Contact record created with purchase order
Recovered from: ORDF-REQ-0002
The system SHALL, when a purchase order is created, also create and associate one contact-information record from the order's shipping information.

#### Scenario: Contact record created with purchase order
- **GIVEN** a new purchase order with shipping information
- **WHEN** it is created
- **THEN** a contact-information record is created and associated with it

### Requirement: Unrestricted purchase order operations
Recovered from: ORDF-REQ-0006
The system SHALL give callers unrestricted access to purchase order operations, with no role check at the component level.

#### Scenario: Unrestricted purchase order operations
- **GIVEN** a caller with no role
- **WHEN** it invokes a purchase order operation
- **THEN** the operation is not refused for lack of a role

### Requirement: Line item write fields
Recovered from: ORDFUL-BR-0003
The system SHALL write each line item with category id, product id, item id, line number, quantity (integer) and unit price (decimal).

#### Scenario: Line item write fields
- **GIVEN** a line item being written
- **WHEN** it is persisted
- **THEN** quantity is stored as an integer and unit price as a decimal

### Requirement: Unrestricted line item reads
Recovered from: order-fulfilment-REQ-0005
The system SHALL allow line item data to be read without any role check.

#### Scenario: Unrestricted line item reads
- **GIVEN** a caller with no role
- **WHEN** it reads line item data
- **THEN** the data is returned

### Requirement: One status per order
ID: SWHM2-R-0011
Recovered from: FULFIL-ENT-0002
The system SHALL store exactly one status (max 20 chars, mandatory) per order identifier in the order manager.

#### Scenario: One status per order
- **GIVEN** an order identifier
- **WHEN** its status is stored
- **THEN** exactly one mandatory status of at most 20 characters exists for it

### Requirement: Index on purchase order user
ID: SWHM2-R-0012
Recovered from: FULFIL-ENT-0003
The system SHALL provide an index on purchase_order supporting lookup by the indexed column (po_user_id).

#### Scenario: Index on purchase order user
- **GIVEN** purchase orders for many users
- **WHEN** orders are looked up by user
- **THEN** the lookup is supported by an index on the user column

### Requirement: Index on purchase order date
ID: SWHM2-R-0013
Recovered from: FULFIL-ENT-0004
The system SHALL provide an index on purchase_order supporting lookup by the indexed column (po_date).

#### Scenario: Index on purchase order date
- **GIVEN** purchase orders over many dates
- **WHEN** orders are looked up by date
- **THEN** the lookup is supported by an index on the date column

### Requirement: Index on order manager status
ID: SWHM2-R-0014
Recovered from: FULFIL-ENT-0005
The system SHALL provide an index on order_manager supporting lookup by the indexed column (status).

#### Scenario: Index on order manager status
- **GIVEN** order manager rows in many statuses
- **WHEN** rows are looked up by status
- **THEN** the lookup is supported by an index on the status column

### Requirement: Line quantity bounds
Recovered from: FULFIL-RULE-0001
The system SHALL require every purchase-order line to have a quantity greater than zero and a quantity shipped not greater than the quantity.

#### Scenario: Line quantity bounds
- **GIVEN** a line with quantity 0
- **WHEN** it is stored
- **THEN** it is rejected as violating the quantity constraint

### Requirement: Supplier order status and stock floor
Recovered from: FULFIL-RULE-0002
The system SHALL keep each supplier order in status PENDING or COMPLETED only, and SHALL NOT allow supplier stock for any item to fall below zero.

#### Scenario: Supplier order status and stock floor
- **GIVEN** a stock update that would make stock negative
- **WHEN** it is applied
- **THEN** it is rejected by the stock constraint

### Requirement: Item without inventory record
Recovered from: OF-RULE-0003
GIVEN a line item for an item that has no inventory record, WHEN fulfilment is attempted, THEN the system SHALL treat the line as not fulfilled.

#### Scenario: Item without inventory record
- **GIVEN** a line for an item with no inventory record
- **WHEN** fulfilment is attempted
- **THEN** the line is not fulfilled

### Requirement: Fully shipped lines are skipped
Recovered from: OF-RULE-0004
The system SHALL skip line items whose shipped quantity already equals the ordered quantity when processing an order.

#### Scenario: Fully shipped lines are skipped
- **GIVEN** a line whose shipped quantity equals its ordered quantity
- **WHEN** the order is processed
- **THEN** the line is skipped and stock is not reduced again

### Requirement: Invoice failure keeps order pending
Recovered from: OF-RULE-0006
GIVEN invoice generation fails for a processed order, WHEN the order is processed, THEN the system SHALL return no invoice and keep the purchase order from being marked as shipped.

#### Scenario: Invoice failure keeps order pending
- **GIVEN** invoice generation fails for an order
- **WHEN** the order is processed
- **THEN** no invoice is returned and the order is not completed

### Requirement: Reprocess only pending orders
Recovered from: OF-RULE-0007
The system SHALL reprocess only purchase orders whose status is PENDING when inventory is updated.

#### Scenario: Reprocess only pending orders
- **GIVEN** orders in PENDING and COMPLETED status
- **WHEN** inventory is updated
- **THEN** only the PENDING orders are reprocessed

### Requirement: New stock quantity validity
Recovered from: OF-RULE-0008
The system SHALL apply a supplied new stock quantity only when it is non-empty and zero or greater; blank or negative values SHALL be ignored.

#### Scenario: New stock quantity validity
- **GIVEN** a blank value and a value of -3
- **WHEN** stock is updated
- **THEN** neither is applied

### Requirement: Only ticked items change
Recovered from: OF-RULE-0009
The system SHALL change stock only for items whose update box was ticked on the inventory screen.

#### Scenario: Only ticked items change
- **GIVEN** an item with a new quantity entered but its box unticked
- **WHEN** the form is submitted
- **THEN** its stock is unchanged

### Requirement: Inventory screen
ID: SWHM2-R-0015
Recovered from: OF-SCR-0001
The system SHALL present an inventory screen listing each item id with its existing quantity, a new-quantity input and an update checkbox, with a submit action.

#### Scenario: Inventory screen
- **GIVEN** inventory items exist
- **WHEN** the inventory screen is displayed
- **THEN** each row shows item id, existing quantity, a new-quantity input and an update checkbox, and a submit control is offered

### Requirement: New orders start PENDING
Recovered from: ORDER-FULFILMENT-BR-0001
The system SHALL create every supplier purchase order with status PENDING, taking the order identifier and order date from the submitted order.

#### Scenario: New orders start PENDING
- **GIVEN** a submitted supplier order
- **WHEN** it is created
- **THEN** its status is PENDING with the submitted id and date

### Requirement: Contact and line items created with order
Recovered from: ORDER-FULFILMENT-BR-0003
The system SHALL, when a supplier purchase order is created, also create a contact record from the order's shipping information and one line item record per submitted line.

#### Scenario: Contact and line items created with order
- **GIVEN** a submitted order with 2 lines
- **WHEN** it is created
- **THEN** one contact record and two line item records exist

### Requirement: Find orders by status
Recovered from: ORDER-FULFILMENT-BR-0004
The system SHALL allow supplier purchase orders to be found by status.

#### Scenario: Find orders by status
- **GIVEN** orders in several statuses
- **WHEN** a search by PENDING is made
- **THEN** only PENDING orders are returned

### Requirement: Five order statuses
Recovered from: ORDER-FULFILMENT-BUSINESS-RULE-0001
The system SHALL recognise the order statuses PENDING, APPROVED, DENIED, SHIPPED_PART and COMPLETED.

#### Scenario: Five order statuses
- **GIVEN** the status set
- **WHEN** a status is assigned
- **THEN** only these five values are recognised

### Requirement: Supplier order record
ID: SWHM2-R-0016
Recovered from: ORDER-FULFILMENT-ENT-0001
The system SHALL record each supplier order with a unique id, date, mandatory status and a mandatory reference to an existing contact info.

#### Scenario: Supplier order record
- **GIVEN** a supplier order
- **WHEN** it is recorded
- **THEN** it has a unique id, a date, a status and a reference to an existing contact info

### Requirement: Supplier order input
Recovered from: ORDER-FULFILMENT-INT-0001
The system SHALL accept a supplier purchase order made up of an order id, an order date, shipping contact information and at least one line item.

#### Scenario: Supplier order input
- **GIVEN** an order message with no line items
- **WHEN** it is accepted
- **THEN** it is rejected as invalid

### Requirement: Order status view
ID: SWHM2-R-0017
Recovered from: ORDER-FULFILMENT-REQ-0001
The system SHALL expose order status as the join of each purchase order (id, user, date, value) with its order manager status.

#### Scenario: Order status view
- **GIVEN** a purchase order and its order manager row
- **WHEN** order status is requested
- **THEN** one row with id, user, date, value and status is listed

### Requirement: Order status progression
Recovered from: ORDF-BR-0001
The system SHALL use the order statuses PENDING, APPROVED, DENIED, SHIPPED_PART and COMPLETED, where an order moves from PENDING to APPROVED or DENIED and from APPROVED through SHIPPED_PART to COMPLETED.

#### Scenario: Order status progression
- **GIVEN** a PENDING order
- **WHEN** it is approved
- **THEN** its status becomes APPROVED

### Requirement: Shipping address equals billing address
Recovered from: ORDF-BR-0005
GIVEN a stored purchase order WHEN it is read back THEN the system SHALL present its shipping address as identical to its billing address.

#### Scenario: Shipping address equals billing address
- **GIVEN** a stored purchase order
- **WHEN** it is read back
- **THEN** shipping and billing addresses are identical

### Requirement: Purchase order persistence
Recovered from: ORDF-ENT-0001
The system SHALL persist a supplier purchase order with a purchase order id, a purchase order date (epoch time), a status and one shipping contact with its line items.

#### Scenario: Purchase order persistence
- **GIVEN** a supplier purchase order
- **WHEN** it is persisted
- **THEN** it holds id, epoch date, status, shipping contact and line items

### Requirement: SupplierOrder XML document
Recovered from: ORDF-INT-0003
The system SHALL send each supplier purchase order as a SupplierOrder XML document containing the order id, order date (yyyy-MM-dd), a shipping section and its line items.

#### Scenario: SupplierOrder XML document
- **GIVEN** an order to send
- **WHEN** it is sent
- **THEN** the XML has order id, a yyyy-MM-dd date, shipping info and line items

### Requirement: Line items returned as plain data
Recovered from: ORDF-REQ-0001
The system SHALL return the line items of a supplier order as plain data objects, because the caller outside the transaction cannot traverse persistent relations.

#### Scenario: Line items returned as plain data
- **GIVEN** a supplier order with line items
- **WHEN** a caller outside the transaction requests them
- **THEN** plain data objects are returned

### Requirement: Identifier counter failure
Recovered from: ORDF-REQ-0004
The system SHALL fail an identifier request with an error when a counter for the requested prefix cannot be created.

#### Scenario: Identifier counter failure
- **GIVEN** a prefix whose counter cannot be created
- **WHEN** an identifier is requested
- **THEN** an error is raised

### Requirement: Identifier generation access
Recovered from: ORDF-REQ-0005
The system SHALL make identifier generation available to other components of the same application only, without role-based restriction.

#### Scenario: Identifier generation access
- **GIVEN** a component of the same application
- **WHEN** it requests an identifier
- **THEN** one is returned without a role check

### Requirement: Validating document parse
Recovered from: ORDFUL-BR-0004
WHEN reading a document the system SHALL parse with validation by default and, for DTD-based documents, SHALL reject a document whose declared type cannot be resolved or validated.

#### Scenario: Validating document parse
- **GIVEN** a DTD-based document that fails validation
- **WHEN** it is read
- **THEN** it is rejected

### Requirement: Approved orders produce supplier orders
Recovered from: order-fulfilment-REQ-0001
The system SHALL, for each order approved, build a supplier purchase order (order id, order date, shipping name/address/e-mail/telephone, and each line item's category, product, item, line number, quantity and unit price) and send it to the supplier purchase-order queue; denied orders SHALL NOT generate a supplier purchase order.

#### Scenario: Approved orders produce supplier orders
- **GIVEN** an approved and a denied order
- **WHEN** approval is processed
- **THEN** a supplier purchase order is sent only for the approved order

### Requirement: Supplier invoice marks lines shipped
ID: SWHM2-R-0018
Recovered from: order-fulfilment-WF-0001
The system SHALL, on receiving a supplier invoice message, mark the invoiced line items as shipped on the purchase order; if all lines of the order are then shipped it SHALL set the order status to COMPLETED and trigger a completed-order notification, otherwise it SHALL set the status to SHIPPED_PART.

#### Scenario: Supplier invoice marks lines shipped
- **GIVEN** an invoice covering all lines of an order
- **WHEN** it is received
- **THEN** the order becomes COMPLETED and a completed-order notification is triggered

### Requirement: Named counters
ID: SWHM2-R-0024
Recovered from: CTR-ENT-0009
The system SHALL store named integer counters, one row per counter name, for generating sequential identifiers.

#### Scenario: Named counters
- **GIVEN** a counter name
- **WHEN** its counter is stored
- **THEN** exactly one row holds its integer value

### Requirement: Inventory quantity per item
ID: SWHM2-R-0025
Recovered from: INV-ENT-0008
The system SHALL store one inventory quantity (required integer) per item id.

#### Scenario: Inventory quantity per item
- **GIVEN** an item id
- **WHEN** its quantity is stored
- **THEN** exactly one required integer quantity exists for it

### Requirement: Fulfil on receiving a purchase order
Recovered from: OF-REQ-0001
The system SHALL, on receiving a supplier purchase order message, persist the purchase order and then attempt to fulfil each of its line items.

#### Scenario: Fulfil on receiving a purchase order
- **GIVEN** a supplier purchase order message
- **WHEN** it is received
- **THEN** the order is persisted and each line fulfilment is attempted

### Requirement: COMPLETED only when all lines shipped
ID: SWHM2-R-0026
Recovered from: OF-RULE-0005
The system SHALL set a supplier purchase order's status to COMPLETED only when every one of its lines is available and shipped; otherwise it SHALL remain PENDING.

#### Scenario: COMPLETED only when all lines shipped
- **GIVEN** an order with one unavailable line
- **WHEN** it is processed
- **THEN** its status is not COMPLETED

### Requirement: Stock clerk inventory update
Recovered from: OF-WF-0001
The system SHALL, when a stock clerk submits inventory updates, set each selected item's quantity, then reprocess all pending purchase orders.

#### Scenario: Stock clerk inventory update
- **GIVEN** a clerk submits a new quantity for a ticked item
- **WHEN** the update is submitted
- **THEN** the quantity is set and pending orders are reprocessed

### Requirement: Four order statuses
Recovered from: ORDER-FULFILMENT-BR-0002
The system SHALL recognise the order statuses PENDING, APPROVED, DENIED and COMPLETED.

#### Scenario: Four order statuses
- **GIVEN** the status set
- **WHEN** a status is assigned
- **THEN** these four values are recognised

### Requirement: Supplier order with contact and lines
Recovered from: ORDER-FULFILMENT-ENTITY-0001
The system SHALL persist each supplier purchase order with an order identifier (its unique key), an order date, a status, one shipping contact and one or more line items.

#### Scenario: Supplier order with contact and lines
- **GIVEN** a supplier purchase order
- **WHEN** it is persisted
- **THEN** it holds a unique id, date, status, one shipping contact and at least one line item

