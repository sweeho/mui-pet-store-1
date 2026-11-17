## ADDED Requirements

### Requirement: Admin endpoint access control
Recovered from: ADMIN-REQ-0001
The system SHALL restrict the order-administration endpoint to authenticated users holding the administrator role, signing them in through a form-based login page.

#### Scenario: Admin endpoint access control
- **GIVEN** a user without the administrator role
- **WHEN** the user requests the order-administration endpoint
- **THEN** the user is sent to the login page and access is refused until signed in as an administrator

### Requirement: Logout
Recovered from: ADMIN-REQ-0003
The system SHALL allow logout, ending the administrator's session, via the logout action.

#### Scenario: Logout
- **GIVEN** a signed-in administrator
- **WHEN** the logout action is chosen
- **THEN** the session ends and further requests require sign-in

### Requirement: Rich-client session check
Recovered from: ADMIN-REQ-0006
The system SHALL reject rich-client requests that carry no existing session with the message "Session Timed Out; Please exit and login as admin from the login page", and reply with an error for unknown request types.

#### Scenario: Rich-client session check
- **GIVEN** a rich-client request with no existing session
- **WHEN** it is processed
- **THEN** the message "Session Timed Out; Please exit and login as admin from the login page" is returned and the request is not processed

### Requirement: Sales reports
Recovered from: ADMIN-REQ-0005
The system SHALL provide sales reports of REVENUE or ORDERS (quantity) between a start and end date, grouped by category or, when a category is requested, by item within it, with a grand total, shown as pie or bar charts.

#### Scenario: Sales reports
- **GIVEN** a start date, end date and report type REVENUE
- **WHEN** a report is requested without a category
- **THEN** revenue per category and a grand total are returned; with a category, per item

### Requirement: Chart data for admin client
Recovered from: admin-order-management-REQ-0002
The system SHALL provide the admin client sales chart data for a date range, totalling either revenue (quantity times unit price) or quantity, per category or per item when a category is selected.

#### Scenario: Chart data for admin client
- **GIVEN** a date range and a type other than REVENUE
- **WHEN** chart data is requested
- **THEN** quantities are totalled instead of revenue

### Requirement: Order operations view
Recovered from: ADMIN-ENT-0001
The system SHALL provide an operations view listing, for every order that has a process-manager status, its order id, user, date, value and status.

#### Scenario: Order operations view
- **GIVEN** one order with a status row and one without
- **WHEN** the view is read
- **THEN** only the order with a status row is listed with id, user, date, value and status

### Requirement: Rich-client XML requests
Recovered from: ADMIN-INT-0001
The system SHALL accept XML requests from the rich client carrying a Type of GETORDERS, UPDATESTATUS, REVENUE or ORDERS, and SHALL answer any other Type with an error response naming the unknown request type.

#### Scenario: Rich-client XML requests
- **GIVEN** an XML request with Type FOO
- **WHEN** it is received
- **THEN** an error response naming the unknown request type is returned

### Requirement: Warn on uncommitted changes at refresh
Recovered from: ADMIN-RULE-0001
GIVEN uncommitted approve or deny changes exist, WHEN the administrator refreshes data, the system SHALL warn that data is not committed and ask for confirmation before discarding.

#### Scenario: Warn on uncommitted changes at refresh
- **GIVEN** uncommitted approve or deny changes
- **WHEN** the administrator refreshes data
- **THEN** a warning is shown asking for confirmation before the changes are discarded

### Requirement: Report date format
Recovered from: ADMIN-RULE-0002
The system SHALL require sales-report dates in MM/dd/yyyy format and tell the administrator when they are not.

#### Scenario: Report date format
- **GIVEN** a report date entered as 2020-01-31
- **WHEN** the report is requested
- **THEN** the administrator is told the date must be MM/dd/yyyy

### Requirement: Admin login and home screens
Recovered from: ADMIN-SCR-0001
The system SHALL present an admin login page asking for a user ID and password, an admin home page offering "Launch Rich Client" and "logout" actions, and a login-error page linking back to sign-in.

#### Scenario: Admin login and home screens
- **GIVEN** an unauthenticated visitor, then an administrator who signs in
- **WHEN** the pages are displayed
- **THEN** the login page asks for user ID and password, the home page offers Launch Rich Client and logout, and a failed sign-in shows an error page linking back to sign-in

### Requirement: Launch descriptor on manage orders
Recovered from: ADMIN-WF-0001
WHEN the administrator chooses to manage orders, the system SHALL return a Java Web Start launch descriptor that starts the rich client against the same server and the administrator's current session.

#### Scenario: Launch descriptor on manage orders
- **GIVEN** an authenticated administrator
- **WHEN** the manage-orders action is chosen
- **THEN** a launch descriptor is returned carrying server, port and session id

### Requirement: Manage orders submission
Recovered from: ADMIN-WFL-0001
GIVEN an authenticated administrator submits the home page form with currentScreen "manageorders", the system SHALL respond with a Java Web Start launch descriptor for the Pet Store Admin rich client, passing the server name, port and the administrator's session ID as arguments.

#### Scenario: Manage orders submission
- **GIVEN** an authenticated administrator submitting currentScreen manageorders
- **WHEN** the form is processed
- **THEN** a Pet Store Admin launch descriptor with server name, port and session ID arguments is returned

### Requirement: Order listing by status for admin client
Recovered from: admin-order-management-REQ-0001
The system SHALL provide the admin client a listing of purchase orders by status giving, for each, order id, user id, order date (month/day/year), order value and status.

#### Scenario: Order listing by status for admin client
- **GIVEN** orders in status PENDING
- **WHEN** the listing is requested for PENDING
- **THEN** each order is returned with id, user id, date as month/day/year, value and status

### Requirement: GETORDERS request
Recovered from: ADMIN-REQ-0002
The system SHALL, on a GETORDERS request carrying a status, return the orders with that status, each with order ID, user ID, order date, order amount and order status, plus a total count.

#### Scenario: GETORDERS request
- **GIVEN** a GETORDERS request with a status
- **WHEN** it is processed
- **THEN** matching orders and the total count are returned

### Requirement: Orders by status without duplicates
Recovered from: ORDF-REQ-0003
The system SHALL return all orders having a given status, without duplicates, for administrators.

#### Scenario: Orders by status without duplicates
- **GIVEN** an order matching the status through more than one row
- **WHEN** orders for that status are requested
- **THEN** the order appears once
