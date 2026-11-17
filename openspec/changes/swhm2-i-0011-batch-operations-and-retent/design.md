# Design notes: legacy implementation of batch operations

## User interface
No screen records were extracted for this capability; its user interface is unspecified.

## Legacy implementation notes
- Scheduler: Control-M definitions (`legacy-source/scheduler/control-m/PS_PETSTORE.xml`). Chain: PS_DB_BACKUP 01:00 -> PS_ORDER_EXTRACT 01:30 (INCOND PS_DB_BACKUP-OK) -> PS_ORDER_AGING_REPORT 01:45, PS_INVENTORY_REPORT 01:50, Sunday PS_ORDER_PURGE 02:00 (all INCOND PS_ORDER_EXTRACT-OK). PS_CATALOG_CHECK 06:00 daily; PS_HEALTH_CHECK cyclic every 10 minutes. Ordering is enforced by the scheduler only; running scripts by hand bypasses it.
- Scripts in `legacy-source/batch/*.sh`, SQL in `legacy-source/db/batch/*.sql` (Derby `ij`, SYSCS_BACKUP_DATABASE, SYSCS_EXPORT_QUERY). Settings in `legacy-source/conf/env.sh` (7-day backup retention, 180-day order retention, 24h stuck threshold, 500-unit low-stock threshold).
- Exit codes: 0 ok, 4 something to act on (aging report, catalog check), 8 SQL/file/HTTP error. Log lines via `ps_log` to batch.log.
- Order extract: epoch-ms window from yesterday 00:00 to today 00:00, no header, trailer `TRAILER,YYYYMMDD,<rows>`.
- Purge: temp table of ids, child rows deleted first, one commit. Inner join on contact_info.
- Indexes on purchase_order user and date, and on order status, support these jobs.
- Inventory population: supplier `InventoryPopulator` loads an XML file, deleting then recreating the record per item id; reports populated only if at least one record exists.

## Suspected legacy defects (for Business Owner)
- Purge claims every order was extracted first, but the extract covers only the previous day; a missed extract day loses data at purge (BATCH-REQ-0004/0002).
- Purge inner join on contact_info leaves orders without contact permanently; address/card rows deleted without checking sharing.
- Catalog check swallows DB errors other than "does not exist"; C4 locale list is a comment, query derives locales from category_details.
- Backup destination hard-coded in SQL while script folder is configurable; prior same-day backup deleted before new one confirmed.
- env.sh defaults host psl-app01 vs documented ps-app01.
- Inventory report omits low-stock items lacking en_US description.
- DB credentials in plain text in env.sh.
