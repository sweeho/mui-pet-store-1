# Batch operations

## Why
The legacy store runs a nightly and recurring batch layer (backup, finance order extract, aging and inventory reports, weekly purge, catalog integrity check, health probe) plus an inventory population load. The rebuild must reproduce the same observable behaviour.

## What changes
- Specify the 15 recovered records of capability `batch-operations` as requirements with scenarios.
- No screen records were extracted for this capability.

## Impact
Retention (180 days), Finance extract format and exit-code conventions are regulated or operational contracts; see design.md for suspected legacy defects the Business Owner must rule on.
