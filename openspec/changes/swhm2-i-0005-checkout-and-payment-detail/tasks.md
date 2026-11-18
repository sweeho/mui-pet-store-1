## 1. Data model

- [ ] 1.1 Define the credit card entity (number, type, expiry text, unique id) (SWHM2-T-0023; SWHM2-R-0027, SWHM2-R-0028, SWHM2-R-0155, SWHM2-R-0158)
- [ ] 1.2 Define the address entity with optional second street line (SWHM2-T-0023; SWHM2-R-0023)
- [ ] 1.3 Define the order record with mandatory contact and payment card (SWHM2-T-0023; SWHM2-R-0153)
- [ ] 1.4 Define the named counter entity for identifier sequences (SWHM2-T-0023; SWHM2-R-0059)

## 2. Rules

- [ ] 2.1 Implement expiry month/year derivation with defaults (SWHM2-T-0023; SWHM2-R-0154, SWHM2-R-0150)
- [ ] 2.2 Implement unique identifier generation and first-use counter creation (SWHM2-T-0023; SWHM2-R-0124, SWHM2-R-0125)
- [ ] 2.3 Create contacts with an empty address when no data is given (SWHM2-T-0023; SWHM2-R-0061)
- [ ] 2.4 Submit orders with the placeholder card pending Business Owner decision (SWHM2-T-0023; SWHM2-R-0152)

## 3. Documents

- [ ] 3.1 Implement ContactInfo, Address and CreditCard document exchange with root checks (SWHM2-T-0023; SWHM2-R-0060, SWHM2-R-0062, SWHM2-R-0063, SWHM2-R-0151)
- [ ] 3.2 Implement the purchase order document (SWHM2-T-0023; SWHM2-R-0157)

## 4. Access

- [ ] 4.1 Allow all callers on credit card operations and run removal in a transaction (SWHM2-T-0023; SWHM2-R-0156)
