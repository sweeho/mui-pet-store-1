# Discovery report SX-0001

Legacy application: Sun Java Pet Store 1.3.2 (J2EE 1.3, EJB 2.x CMP, JMS, custom WAF controller; no Struts). About 570 files.

## Modules
Four applications (`apps/petstore` storefront with 67 JSPs including zh/ja copies, `apps/opc` order processing, `apps/supplier`, `apps/admin`), 18 components, the `waf` framework, DDL (`db/schema`, 20 tables, 5 CHECK constraints), 7 batch scripts with SQL and a Control-M schedule. Ranking is in `risk-scores.csv`; LOC counts Java, JSP, XML, SQL and shell, excluding `build.xml`.

## Order flow
Storefront -> JMS -> OPC approves automatically below a regional limit or waits for admin -> supplier ships and invoices -> OPC completes.

## Risk notes
- Order approval limit appears as a bare literal (`< 50000` in `apps/opc/.../PurchaseOrderMDB.java:188`) while README says US 500 / JP 50000: verify both and the code path (possible conflict).
- DDL CHECKs: order status (PENDING, APPROVED, DENIED, COMPLETED), quantity > 0, shipped <= quantity, inventory >= 0.
- Batch rules: purge COMPLETED/DENIED orders older than 180 days after extract; aging report flags PENDING/APPROVED older than 24h. Cloudscape and Oracle DDL are near-duplicates (check for drift).
- `opc` holds `OrderApprovalTD` and `OrderApprovalMDB`; check reachability.

## Exclusions
- Localised JSP copies under `apps/petstore/src/docroot/zh` and `ja`: extract English once; treat as the localisation capability.
- `lib/jstl`, `lib/base64`, `build.*`, `setup.*`, `*.mf`, `sun-j2ee-ri.xml`, COPYRIGHT/LICENSE html: third-party or build material.
- `waf` taglib/template code: framework plumbing; only the controller state machine and `requestmappings.xml` may hold workflow rules.
- `*_test.jsp`, `util/tracer`, `encodingfilter`: no business rules expected.
- `data/`, `docs/`, `vortex/` are listed in README but absent from this tree.

## Coverage limits
Survey used file and line counts, README and spot reads; dependency edges are inferred, not traced.
