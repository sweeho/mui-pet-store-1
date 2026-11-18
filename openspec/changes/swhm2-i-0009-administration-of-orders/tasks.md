## 1. Access and session

- [ ] 1.1 Restrict the order-administration endpoint to the administrator role with form login (SWHM2-T-0050; SWHM2-R-0139)
- [ ] 1.2 Implement logout ending the session (SWHM2-T-0050; SWHM2-R-0140)
- [ ] 1.3 Reject rich-client requests without a session with the timeout message (SWHM2-T-0050; SWHM2-R-0142)

## 2. Screens and launch

- [ ] 2.1 Build login page, admin home page and login-error page (SWHM2-T-0050; SWHM2-R-0037)
- [ ] 2.2 Return the launch descriptor for manageorders (SWHM2-T-0050; SWHM2-R-0038, SWHM2-R-0039)

## 3. Request protocol

- [ ] 3.1 Accept XML requests GETORDERS, UPDATESTATUS, REVENUE, ORDERS and error on unknown types (SWHM2-T-0050; SWHM2-R-0034)

## 4. Orders

- [ ] 4.1 List orders by status without duplicates with count (SWHM2-T-0050; SWHM2-R-0040, SWHM2-R-0120, SWHM2-R-0121)
- [ ] 4.2 Warn before discarding uncommitted approve/deny changes on refresh (SWHM2-T-0050; SWHM2-R-0035)
- [ ] 4.3 Provide the operations view of orders with a status (SWHM2-T-0050; SWHM2-R-0033)

## 5. Sales reports

- [ ] 5.1 Provide revenue and quantity reports by category or item with totals (SWHM2-T-0050; SWHM2-R-0141, SWHM2-R-0138)
- [ ] 5.2 Validate MM/dd/yyyy report dates (SWHM2-T-0050; SWHM2-R-0036)
