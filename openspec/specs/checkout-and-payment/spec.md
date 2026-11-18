# checkout-and-payment Specification

## Purpose

TBD - created by archiving change swhm2-i-0005-checkout-and-payment-detail. Update Purpose after archive.

## Requirements

### Requirement: Address storage

ID: SWHM2-R-0023
Recovered from: CUS-ENT-0003
The system SHALL store an address with required street line 1, city, state, zip code and country, optional street line 2, identified by a unique address id.

#### Scenario: Address storage case

ID: SWHM2-R-0023.01

- **GIVEN** an address with street line 1, city, state, zip code and country
- **WHEN** it is stored
- **THEN** it receives a unique address id and street line 2 may be absent

#### Scenario: Address storage case

ID: SWHM2-R-0023.02

- **GIVEN** an address without a city
- **WHEN** it is stored
- **THEN** the store rejects it as missing a required value

### Requirement: Placeholder payment card on order submission

ID: SWHM2-R-0152
Recovered from: CHK-REQ-0006
The system SHALL submit every order with a fixed placeholder payment card (number 1234-2334, type Duke Express, expiry 10/2001) rather than the customer's card.

#### Scenario: Placeholder payment card on order submission case

ID: SWHM2-R-0152.01

- **GIVEN** a customer with a saved credit card
- **WHEN** the customer submits an order
- **THEN** the order carries card 1234-2334, type Duke Express, expiry 10/2001, not the customer's card

### Requirement: Credit card expiry defaults

ID: SWHM2-R-0150
Recovered from: CHK-BR-0002
The system SHALL return month "01" and year "2010" when the card expiry text is missing or contains no slash.

#### Scenario: Credit card expiry defaults case

ID: SWHM2-R-0150.01

- **GIVEN** a card whose expiry text is missing or has no slash
- **WHEN** the expiry month or year is read
- **THEN** month "01" and year "2010" are returned

### Requirement: No validation of contact name, telephone and email

ID: SWHM2-R-0151
Recovered from: CHK-BR-0004
The system SHALL NOT apply any validation to name, telephone or email values in the contact component; the email element alone is read with the empty-content-allowed flag.

#### Scenario: No validation of contact name, telephone and email case

ID: SWHM2-R-0151.01

- **GIVEN** a contact with an empty email element
- **WHEN** the contact document is read
- **THEN** the empty email is accepted and no validation error is raised

### Requirement: Order record

ID: SWHM2-R-0153
Recovered from: CHECKOUT-AND-PAYMENT-ENT-0001
The system SHALL record each customer purchase order with a unique order id, user id, email, date, locale, total value, and a mandatory contact record and payment card.

#### Scenario: Order record case

ID: SWHM2-R-0153.01

- **GIVEN** a submitted order
- **WHEN** it is recorded
- **THEN** it carries order id, user id, email, date, locale, total, contact and payment card

#### Scenario: Order record case

ID: SWHM2-R-0153.02

- **GIVEN** an order with no payment card
- **WHEN** it is recorded
- **THEN** the record is rejected

### Requirement: Card expiry month/year text

ID: SWHM2-R-0154
Recovered from: CHK-BR-0001
The system SHALL store the card expiry as a single "month/year" text, and SHALL derive the expiry month as the text before the first slash and the expiry year as the text after it.

#### Scenario: Card expiry month/year text case

ID: SWHM2-R-0154.01

- **GIVEN** a card with expiry "04/2008"
- **WHEN** month and year are read
- **THEN** month is "04" and year is "2008"

### Requirement: Credit card attributes

ID: SWHM2-R-0027
Recovered from: CHK-ENT-0001
The system SHALL hold a credit card as three text attributes: card number, card type and expiry date.

#### Scenario: Credit card attributes case

ID: SWHM2-R-0027.01

- **GIVEN** a credit card
- **WHEN** it is held
- **THEN** it has card number, card type and expiry date as text

### Requirement: Credit card creation

ID: SWHM2-R-0155
Recovered from: CHK-REQ-0001
The system SHALL create a credit card record from either a card number, type and expiry, or an existing credit card data object, and SHALL allow creation with no data.

#### Scenario: Credit card creation case

ID: SWHM2-R-0155.01

- **GIVEN** a card number, type and expiry
- **WHEN** a card is created
- **THEN** the card holds those values

#### Scenario: Credit card creation case

ID: SWHM2-R-0155.02

- **GIVEN** an existing credit card data object
- **WHEN** a card is created from it
- **THEN** the card holds the object's values

### Requirement: Credit card operation access and removal transaction

ID: SWHM2-R-0156
Recovered from: CHK-REQ-0002
The system SHALL allow any caller to invoke every credit card operation, and SHALL run removal of a credit card within a transaction.

#### Scenario: Credit card operation access and removal transaction case

ID: SWHM2-R-0156.01

- **GIVEN** an unauthenticated caller
- **WHEN** it invokes a credit card operation
- **THEN** the operation is permitted

#### Scenario: Credit card operation access and removal transaction case

ID: SWHM2-R-0156.02

- **GIVEN** a credit card removal
- **WHEN** it runs
- **THEN** it runs within a transaction

### Requirement: Purchase order document

ID: SWHM2-R-0157
Recovered from: CHKOUT-INT-0001
The system SHALL carry a purchase order as a document with user id, email, order date, ship and bill addresses, total price, credit card (number, expiry date, card type) and one or more line items.

#### Scenario: Purchase order document case

ID: SWHM2-R-0157.01

- **GIVEN** a purchase order
- **WHEN** it is exchanged as a document
- **THEN** it contains all listed parts and at least one line item

### Requirement: Stored credit card

ID: SWHM2-R-0028
Recovered from: CUS-ENT-0005
The system SHALL store a credit card with required card number, card type and expiry date, identified by a unique card id.

#### Scenario: Stored credit card case

ID: SWHM2-R-0028.01

- **GIVEN** a credit card
- **WHEN** it is stored
- **THEN** it receives a unique card id

#### Scenario: Stored credit card case

ID: SWHM2-R-0028.02

- **GIVEN** a card without expiry date
- **WHEN** it is stored
- **THEN** it is rejected

### Requirement: Payment card storage

ID: SWHM2-R-0158
Recovered from: PAY-ENT-0001
The system SHALL store a payment card as card number, card type and expiry date (text such as 04/04), all mandatory, and SHALL store the card number unencrypted.

#### Scenario: Payment card storage case

ID: SWHM2-R-0158.01

- **GIVEN** a payment card with number, type and expiry 04/04
- **WHEN** it is stored
- **THEN** all three are persisted, the number in clear text

### Requirement: Identifier sequence storage

ID: SWHM2-R-0059
Recovered from: CHK-ENT-0003
The system SHALL persist each identifier sequence as a record keyed by a unique name holding an integer counter.

#### Scenario: Identifier sequence storage case

ID: SWHM2-R-0059.01

- **GIVEN** a sequence named 1001
- **WHEN** it is persisted
- **THEN** one record keyed 1001 holds an integer counter

### Requirement: Contact information document

ID: SWHM2-R-0060
Recovered from: CHK-INT-0003
The system SHALL exchange contact information as an XML element ContactInfo with children FamilyName, GivenName, Address, Email, Phone in that order, and SHALL reject a document whose root is not ContactInfo.

#### Scenario: Contact information document case

ID: SWHM2-R-0060.01

- **GIVEN** a ContactInfo document with children in order
- **WHEN** it is read
- **THEN** the contact is built from it

#### Scenario: Contact information document case

ID: SWHM2-R-0060.02

- **GIVEN** a document whose root is not ContactInfo
- **WHEN** it is read
- **THEN** it is rejected

### Requirement: Contact created with empty address

ID: SWHM2-R-0061
Recovered from: CHK-REQ-0003
The system SHALL, when a contact is created with no data, create it with an empty address record attached.

#### Scenario: Contact created with empty address case

ID: SWHM2-R-0061.01

- **GIVEN** no contact data
- **WHEN** a contact is created
- **THEN** it has an empty address record attached

### Requirement: Address document reading

ID: SWHM2-R-0062
Recovered from: CHK-REQ-0004
The system SHALL read an address from an Address element requiring street, city, state, zip code and country in that order, accepting an optional second street line, and SHALL reject a document whose root is not Address.

#### Scenario: Address document reading case

ID: SWHM2-R-0062.01

- **GIVEN** an Address element with required children
- **WHEN** it is read
- **THEN** an address is built, with the second street line optional

#### Scenario: Address document reading case

ID: SWHM2-R-0062.02

- **GIVEN** an element not named Address
- **WHEN** it is read
- **THEN** it is rejected

### Requirement: Credit card document

ID: SWHM2-R-0063
Recovered from: CHK-REQ-0005
The system SHALL exchange a credit card as an XML document with elements CardNumber, CardType and ExpiryDate, in that order, and SHALL reject a document whose root is not CreditCard.

#### Scenario: Credit card document case

ID: SWHM2-R-0063.01

- **GIVEN** a credit card
- **WHEN** it is written as a document
- **THEN** it has CardNumber, CardType, ExpiryDate in that order

#### Scenario: Credit card document case

ID: SWHM2-R-0063.02

- **GIVEN** a document whose root is not CreditCard
- **WHEN** it is read
- **THEN** it is rejected

### Requirement: Unique identifier generation

ID: SWHM2-R-0124
Recovered from: CHK-RULE-0001
The system SHALL produce a unique identifier for a named sequence by incrementing that sequence's counter by one and returning the sequence name followed by the new counter value as text.

#### Scenario: Unique identifier generation case

ID: SWHM2-R-0124.01

- **GIVEN** sequence "1001" with counter 1
- **WHEN** an identifier is requested
- **THEN** the counter becomes 2 and "10012" is returned

### Requirement: First identifier for new sequence

ID: SWHM2-R-0125
Recovered from: CHK-RULE-0002
GIVEN an identifier is requested for a sequence name that has no counter yet, the system SHALL create a counter for that name starting at 0 and return the first identifier (count 1).

#### Scenario: First identifier for new sequence case

ID: SWHM2-R-0125.01

- **GIVEN** no counter for name "1001"
- **WHEN** an identifier is requested
- **THEN** a counter starting at 0 is created and "10011" is returned
