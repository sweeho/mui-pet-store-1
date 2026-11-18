## 1. Data model

- [x] 1.1 Define the order process-manager status with values PENDING, APPROVED, DENIED, COMPLETED, one per order (SWHM2-T-0029; SWHM2-R-0077)
- [x] 1.2 Define the order-approval message structure (list of order id and status) (SWHM2-T-0029; SWHM2-R-0078, SWHM2-R-0130)

## 2. Automatic approval

- [x] 2.1 Persist a received purchase order and register it PENDING before evaluating approval (SWHM2-T-0029; SWHM2-R-0079)
- [x] 2.2 Implement the regional limit rule (US < 500, Japan < 50000, other locales never) (SWHM2-T-0029; SWHM2-R-0174, SWHM2-R-0175, SWHM2-R-0171)
- [x] 2.3 Publish an APPROVED order-approval message only for qualifying orders (SWHM2-T-0029; SWHM2-R-0079, SWHM2-R-0078)

## 3. Approval processing

- [x] 3.1 Ignore orders whose current status is not PENDING (SWHM2-T-0029; SWHM2-R-0172, SWHM2-R-0176)
- [x] 3.2 Update status of PENDING orders to the decided status (SWHM2-T-0029; SWHM2-R-0173, SWHM2-R-0130)
- [x] 3.3 Build and send the supplier purchase order for APPROVED orders (SWHM2-T-0029; SWHM2-R-0130)
- [x] 3.4 Add changed orders to the customer notification list (SWHM2-T-0029; SWHM2-R-0173)

## 4. Administrator decisions

- [x] 4.1 Allow changing only PENDING orders to Approved or Denied, singly or in bulk (SWHM2-T-0029; SWHM2-R-0170, SWHM2-R-0169)
- [x] 4.2 Send changes only on explicit Commit and omit orders left PENDING (SWHM2-T-0029; SWHM2-R-0169, SWHM2-R-0170)
