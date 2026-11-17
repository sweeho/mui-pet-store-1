## Legacy implementation notes

- Credit card: CMP entity bean CreditCardEJB with String fields cardNumber, cardType, expiryDate. Expiry month and year are derived by splitting on the first slash; defaults "01" and "2010" apply when absent. ejb-jar.xml grants unchecked access to all methods and uses transaction attribute Required.
- Address and ContactInfo: plain data classes with DOM (de)serialisation via XMLDocumentUtils; a ContactInfo EJB creates an address bean on creation, looking it up through the address service.
- Unique ids: UniqueIdGeneratorEJB uses a Counter entity keyed by name; the id is name concatenated with the incremented count.
- Order web action submits a fixed placeholder card instead of the customer's card (OrderHTMLAction).
- Database: Oracle and Cloudscape/Derby DDL under legacy-source/db/schema; card numbers are stored in clear text.
- Consolidated records carry keys that differ from the pass-file keys; statements truncated in the stage prompt were reconstructed from the component code. Reviewers should check CHK-REQ-0001, CHK-REQ-0004 and CHK-REQ-0005 wording (reject on wrong root) against the code.

## User interface

No screen records were extracted for this capability; its user interface is unspecified.
