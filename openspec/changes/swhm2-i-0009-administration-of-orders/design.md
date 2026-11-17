# Legacy implementation notes

- Access control: `web.xml` security-constraint on `/AdminRequestProcessor` (role `administrator`, FORM login `login.jsp`). The rich-client endpoint `/ApplRequestProcessor` is not constrained and relies on a session-exists check in `ApplRequestProcessor.java` (suspected defect: weaker than the console).
- Screens: `login.jsp`, `index.jsp`, error page. The home form posts `currentScreen=manageorders` to `AdminRequestProcessor`, which returns a Web Start descriptor (host, port, session id as arguments).
- Rich client: `PetStoreAdminClient`, `OrdersApprovePanel`, `DataSource`, `HttpPostPetStoreProxy` post XML to `ApplRequestProcessor`; request types GETORDERS, UPDATESTATUS, REVENUE, ORDERS.
- Order listing: `OPCAdminFacadeEJB.getOrdersByStatus`; date formatted manually M/D/YYYY; FinderException wrapped in OPCAdminFacadeException. `ProcessManagerEJB`/`ManagerEJB` supply orders by status.
- Charts: `OPCAdminFacadeEJB.getChartInfo`; any request other than REVENUE is treated as quantity; revenue uses Float arithmetic.
- DB: view `V_ORDER_STATUS` (inner join PURCHASE_ORDER to ORDER_MANAGER) in `petstore_oracle.sql`.
- Session timeout of 54 minutes appears in a competing pass (not an approved record); unverified.
- Discrepancy: REQ-0001 refers to a "form-based login" while rich-client requests rely only on session presence.
