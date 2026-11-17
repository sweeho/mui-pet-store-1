## 1. Scheduling and conventions

- [ ] 1.1 Implement the nightly chain with ordering and dependency conditions
- [ ] 1.2 Implement exit-code convention (0/4/8) and start/end time-stamped job logging
- [ ] 1.3 Hold the extract and notify operations when the backup fails

## 2. Backup and extract

- [ ] 2.1 Implement the daily online backup into a dated folder with 7-day pruning
- [ ] 2.2 Implement the previous-day order extract with trailer line
- [ ] 2.3 Implement extract failure handling (no file, exit 8, finance notification)

## 3. Reports and checks

- [ ] 3.1 Implement the order aging report with STUCK and MISMATCH rows and exit 4
- [ ] 3.2 Implement the low-stock inventory report
- [ ] 3.3 Implement the five catalog integrity checks
- [ ] 3.4 Implement first-load catalog request when catalog tables are missing
- [ ] 3.5 Implement the 10-minute module health check

## 4. Purge and data

- [ ] 4.1 Implement the weekly retention purge in one transaction
- [ ] 4.2 Block purge unless the day's extract succeeded
- [ ] 4.3 Add indexes on order user, order date and order status
- [ ] 4.4 Implement inventory load from XML population file
