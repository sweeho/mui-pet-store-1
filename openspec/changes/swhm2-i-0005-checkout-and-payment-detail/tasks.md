## 1. Data model

- [ ] 1.1 Define the credit card entity (number, type, expiry text, unique id)
- [ ] 1.2 Define the address entity with optional second street line
- [ ] 1.3 Define the order record with mandatory contact and payment card
- [ ] 1.4 Define the named counter entity for identifier sequences

## 2. Rules

- [ ] 2.1 Implement expiry month/year derivation with defaults
- [ ] 2.2 Implement unique identifier generation and first-use counter creation
- [ ] 2.3 Create contacts with an empty address when no data is given
- [ ] 2.4 Submit orders with the placeholder card pending Business Owner decision

## 3. Documents

- [ ] 3.1 Implement ContactInfo, Address and CreditCard document exchange with root checks
- [ ] 3.2 Implement the purchase order document

## 4. Access

- [ ] 4.1 Allow all callers on credit card operations and run removal in a transaction
