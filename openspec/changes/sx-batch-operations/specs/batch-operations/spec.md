## ADDED Requirements

### Requirement: Supplier inventory population
The system SHALL allow supplier inventory to be loaded from an XML population file mapping each item id to a quantity.
Recovered from: BO-REQ-0001

#### Scenario: Inventory file loaded
- **GIVEN** a population file listing item ids with quantities
- **WHEN** the load is run
- **THEN** each item id has an inventory record with the listed quantity

### Requirement: Inventory load replaces existing records
The system SHALL load initial inventory from the XML population file, replacing any existing record for the same item id, and SHALL report inventory as populated only when at least one inventory record exists.
Recovered from: OF-REQ-0004

#### Scenario: Existing record replaced
- **GIVEN** an inventory record for item X with quantity 10
- **WHEN** the file loads item X with quantity 50
- **THEN** item X has exactly one record with quantity 50

#### Scenario: Empty inventory
- **GIVEN** no inventory records exist
- **WHEN** population status is requested
- **THEN** inventory is reported as not populated

### Requirement: Weekly order purge
The system SHALL, every Sunday, permanently delete orders whose status is COMPLETED or DENIED and whose order time is earlier than local midnight 180 days ago, together with their lines, supplier orders and lines, order-process record, contact information, address and payment card, in one transaction.
Recovered from: BATCH-BRULE-0001

#### Scenario: Old finished order purged
- **GIVEN** a COMPLETED order dated 200 days ago
- **WHEN** the Sunday purge runs
- **THEN** the order and its dependent records are deleted together

#### Scenario: Open orders kept
- **GIVEN** a PENDING order and an APPROVED order dated 300 days ago
- **WHEN** the purge runs
- **THEN** both orders remain

### Requirement: Purge depends on successful extract
The system SHALL NOT purge any order unless that day's order extract has completed successfully.
Recovered from: BATCH-BRULE-0002

#### Scenario: Extract failed
- **GIVEN** today's order extract failed
- **WHEN** the Sunday purge is due
- **THEN** no order is purged

### Requirement: Daily order extract
The system SHALL export the previous calendar day's purchase orders (order time from yesterday 00:00 inclusive to today 00:00 exclusive) to orders_YYYYMMDD.csv with no header row, columns order number, user name, order time (epoch ms), locale, order total, number of lines and status, ordered by order number, and a final line TRAILER,YYYYMMDD,<row count>.
Recovered from: BATCH-REQ-0002

#### Scenario: Orders extracted
- **GIVEN** 3 orders placed yesterday
- **WHEN** the extract runs
- **THEN** the file holds 3 rows ordered by order number followed by TRAILER,YYYYMMDD,3

### Requirement: Daily database backup
The system SHALL take an online backup of the store database daily, store it in a folder named with the run date (YYYYMMDD), and delete dated backup folders older than 7 days.
Recovered from: BATCH-REQ-0001

#### Scenario: Backup taken and pruned
- **GIVEN** backup folders from 10 days ago and 2 days ago
- **WHEN** the 01:00 backup completes
- **THEN** a folder for today exists, the 10-day-old folder is removed and the 2-day-old folder remains

### Requirement: Extract failure handling
The system SHALL, when the order extract fails, leave the order extract file unproduced, end the job with code 8, and notify the finance mailbox.
Recovered from: BATCH-REQ-0003

#### Scenario: Extract query fails
- **GIVEN** the extract query raises an error
- **WHEN** the extract job runs
- **THEN** no extract file is produced, the job exits with code 8 and finance is notified

### Requirement: Order aging report
The system SHALL produce daily a report file order_aging_YYYYMMDD.txt listing every order still PENDING or APPROVED whose order time is more than 24 hours old (STUCK rows, oldest first), a count per status, and each order the supplier marked COMPLETED while the order status is not COMPLETED (MISMATCH rows), and SHALL end with exit code 4 when any STUCK or MISMATCH row exists.
Recovered from: BATCH-REQ-0004

#### Scenario: Stuck order found
- **GIVEN** an APPROVED order placed 30 hours ago
- **WHEN** the aging report runs
- **THEN** a STUCK row is listed and the job exits with code 4

#### Scenario: Nothing to report
- **GIVEN** no stuck or mismatched orders
- **WHEN** the aging report runs
- **THEN** the job exits with code 0

### Requirement: Low-stock inventory report
The system SHALL produce daily a file inventory_YYYYMMDD.txt listing supplier items whose stock quantity is below 500 units, lowest quantity first then item id, with item id, product id and English description, followed by the count of items tracked and total units in stock.
Recovered from: BATCH-REQ-0005

#### Scenario: Low item listed
- **GIVEN** item A with 120 units and item B with 900 units
- **WHEN** the report runs
- **THEN** only item A is listed, followed by the totals line

### Requirement: Catalog integrity checks
The system SHALL check catalog integrity daily at 06:00 with five checks: C1 category with no product, C2 product with no item, C3 item whose list price is below unit cost, C4 item missing a description for a locale of its category, C5 item with no supplier inventory record, and SHALL end with exit code 4 when any check returns rows.
Recovered from: BATCH-REQ-0006

#### Scenario: Item priced below cost
- **GIVEN** an item with list price below unit cost
- **WHEN** the catalog check runs
- **THEN** a C3 row is reported and the job exits with code 4

### Requirement: First load when catalog is missing
The system SHALL, when the catalog tables do not exist at catalog check time, request a first (non-forced) load of the catalog, re-run the checks, and end with exit code 8 if that request fails.
Recovered from: BATCH-REQ-0007

#### Scenario: Catalog tables absent
- **GIVEN** the catalog tables do not exist
- **WHEN** the catalog check runs
- **THEN** a non-forced catalog load is requested and the checks are re-run

#### Scenario: Load request fails
- **GIVEN** the catalog tables do not exist and the load request fails
- **WHEN** the catalog check runs
- **THEN** the job exits with code 8

### Requirement: Module health check
The system SHALL check every 10 minutes that the storefront main screen, order processing entry page, supplier entry page and admin entry page answer HTTP 200 within 20 seconds each, log each that does not, and end with exit code 8 when any fails.
Recovered from: BATCH-REQ-0008

#### Scenario: Module not answering
- **GIVEN** the supplier entry page returns HTTP 503
- **WHEN** the health check runs
- **THEN** the failure is logged and the job exits with code 8

### Requirement: Job logging and exit codes
The system SHALL write one time-stamped log line at the start and at the end of each batch job, and SHALL use exit code 0 for success, 4 when a report or check found something to act on and 8 for a SQL, file or HTTP error.
Recovered from: BATCH-REQ-0009

#### Scenario: Successful job
- **GIVEN** a batch job that finds nothing to act on
- **WHEN** it runs
- **THEN** start and end lines are logged and it exits with code 0

### Requirement: Batch support indexes
The system SHALL maintain indexes on purchase order user and date and on order status to support the batch jobs that filter by those columns.
Recovered from: BATCH-RULE-0001

#### Scenario: Indexes present
- **GIVEN** a freshly created database
- **WHEN** its schema is inspected
- **THEN** indexes exist on purchase order user, order date and order status

### Requirement: Nightly batch chain order
The system SHALL run the nightly batch chain in this order: database backup at 01:00; order extract at 01:30 only after the backup succeeded; order aging report at 01:45, inventory report at 01:50 and, on Sundays only, order purge at 02:00, each only after the order extract succeeded.
Recovered from: BATCH-WORKFLOW-0001

#### Scenario: Backup fails
- **GIVEN** the 01:00 backup failed
- **WHEN** 01:30 arrives
- **THEN** the order extract is held and operations is notified

#### Scenario: Weekday
- **GIVEN** the extract succeeded on a Wednesday
- **WHEN** 02:00 arrives
- **THEN** the purge does not run
