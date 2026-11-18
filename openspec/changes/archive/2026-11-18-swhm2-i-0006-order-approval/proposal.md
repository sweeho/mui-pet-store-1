## Why

Orders must be approved before fulfilment. The legacy application approves small US and Japan orders automatically and holds all others for an administrator. This change records that behaviour so it can be rebuilt.

## What Changes

- Automatic approval of received purchase orders under a regional limit.
- Administrator approve/deny of PENDING orders, singly or in bulk, sent on explicit Commit.
- Processing of approval messages: only PENDING orders change; approved orders go on to the supplier, changed orders go to customer notification.
- Order status values PENDING, APPROVED, DENIED, COMPLETED.

## Impact

- Capability: order-approval (12 extracted records, 0 screen records).
