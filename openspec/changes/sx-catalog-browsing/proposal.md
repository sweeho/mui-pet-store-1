## Why

Recover the legacy Pet Store catalog-browsing behaviour (category, product and item listing, single lookups, keyword search, and the catalog data model) as a verifiable specification for the rebuild.

## What Changes

- Adds 20 requirements covering the catalog data model and indexes, locale-filtered paged listings, single-entry lookup, keyword search, error handling, and the storefront paging and price display.
- No screen records were extracted for this capability.

## Impact

- Affected capability: catalog-browsing.
- Open questions: item list order is undefined in the legacy SQL; search case-sensitivity differs between database variants; paging text conflicts between passes (see design.md).
