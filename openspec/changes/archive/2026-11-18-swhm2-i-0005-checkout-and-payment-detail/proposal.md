## Why

Recover the checkout-and-payment behaviour of the legacy Pet Store (credit card, address, contact, order document, unique id generation) as a verifiable specification for the rebuild.

## What Changes

- Adds 19 requirements covering credit card and payment card storage and expiry parsing, contact and address documents, the purchase order record and document, and unique identifier generation.
- No screen records were extracted for this capability.

## Impact

Affected capability: checkout-and-payment. Source: components creditcard, address, contactinfo, uidgen, xmldocuments, the petstore web app and the DDL under legacy-source/db/schema.
