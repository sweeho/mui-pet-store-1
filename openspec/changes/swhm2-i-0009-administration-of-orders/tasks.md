## 1. Access and session

- [ ] 1.1 Restrict the order-administration endpoint to the administrator role with form login
- [ ] 1.2 Implement logout ending the session
- [ ] 1.3 Reject rich-client requests without a session with the timeout message

## 2. Screens and launch

- [ ] 2.1 Build login page, admin home page and login-error page
- [ ] 2.2 Return the launch descriptor for manageorders

## 3. Request protocol

- [ ] 3.1 Accept XML requests GETORDERS, UPDATESTATUS, REVENUE, ORDERS and error on unknown types

## 4. Orders

- [ ] 4.1 List orders by status without duplicates with count
- [ ] 4.2 Warn before discarding uncommitted approve/deny changes on refresh
- [ ] 4.3 Provide the operations view of orders with a status

## 5. Sales reports

- [ ] 5.1 Provide revenue and quantity reports by category or item with totals
- [ ] 5.2 Validate MM/dd/yyyy report dates
