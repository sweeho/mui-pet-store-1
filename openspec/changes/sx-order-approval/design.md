## Context

Legacy implementation notes for order-approval. Recovered from the OPC order-processing bean and the admin client.

## Legacy implementation

- PurchaseOrderMDB (`legacy-source/app/src/apps/opc/.../PurchaseOrderMDB.java`) persists the order, registers it PENDING with the process manager, then calls `canIApprove`. Limits are hard-coded literals (US < 500, Japan < 50000, strict less-than), not configurable; the runbook agrees on the values. Any other locale falls through to false.
- An automatic approval is published as an order-approval message to the order-approval queue, so it follows the same path as an administrator decision.
- The approval message is an OrderApproval document of Order entries (OrderId, OrderStatus). The approval handler processes each entry only when the current status is PENDING; APPROVED entries additionally produce a supplier purchase order, and every changed order is listed for customer notification.
- The admin rich client keeps status choices locally until Commit, then sends one order-approval message asynchronously and replies SUCCESS without waiting for application of the status.
- Status is stored one value per order id in the process-manager table (PENDING, APPROVED, DENIED, COMPLETED; up to 20 characters per the DDL).

## Open points

- The admin user documents describe PENDING as "total exceeds the region limit", while the code also leaves non-US/JP orders PENDING; the code was followed.
- Limits are bare literals with no authoritative configuration source.

## User interface

No screen records were extracted for this capability; its user interface is unspecified. The admin client behaviour is stated only as workflow requirements.
