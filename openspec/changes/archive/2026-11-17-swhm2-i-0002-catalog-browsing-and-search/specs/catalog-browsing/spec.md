## ADDED Requirements

### Requirement: Catalog entity hierarchy and categories
ID: SWHM2-R-0019
Recovered from: CAT-ENT-0001
The system SHALL store each product category under a unique 10-character category id, and SHALL store its per-locale details (name required) one row per category and locale.

#### Scenario: Catalog entity hierarchy and categories
ID: SWHM2-R-0019.01
- **GIVEN** a category and a locale
- **WHEN** a category detail row is stored
- **THEN** it is keyed by (category id, locale) and the name is required

### Requirement: Item identity
ID: SWHM2-R-0020
Recovered from: CAT-ENT-0002
The system SHALL store each item under a unique 10-character item id that MUST reference an existing product.

#### Scenario: Item identity
ID: SWHM2-R-0020.01
- **GIVEN** an item whose product does not exist
- **WHEN** the item is stored
- **THEN** the store is rejected

### Requirement: Product identity and category
ID: SWHM2-R-0021
Recovered from: CATALOG-ENT-0001
The system SHALL store each product with a unique product identifier (max 10 chars) and a mandatory category that MUST exist in the category table.

#### Scenario: Product identity and category
ID: SWHM2-R-0021.01
- **GIVEN** a product with no category
- **WHEN** it is stored
- **THEN** the store is rejected

### Requirement: Product localised details
ID: SWHM2-R-0022
Recovered from: CATALOG-ENT-0002
The system SHALL store per-locale product details keyed by (productid, locale), each with a mandatory name up to 80 chars, optional image and description up to 255 chars, referencing an existing product.

#### Scenario: Product localised details
ID: SWHM2-R-0022.01
- **GIVEN** a product detail without a name
- **WHEN** it is stored
- **THEN** the store is rejected

### Requirement: Item localised details
ID: SWHM2-R-0001
Recovered from: CATALOG-ENT-0003
The system SHALL store per-locale item details keyed by (itemid, locale) with mandatory list price and unit cost (decimal 10,2), image and description, and up to five optional attributes of 80 chars, referencing an existing item.

#### Scenario: Item localised details
ID: SWHM2-R-0001.01
- **GIVEN** an item detail without a unit cost
- **WHEN** it is stored
- **THEN** the store is rejected

### Requirement: Product category index
ID: SWHM2-R-0007
Recovered from: CATALOG-ENT-0004
The system SHALL provide an index on product supporting lookup by category id.

#### Scenario: Product category index
ID: SWHM2-R-0007.01
- **GIVEN** products in many categories
- **WHEN** products are looked up by category id
- **THEN** an index on the category id column supports the lookup

### Requirement: Item product index
ID: SWHM2-R-0008
Recovered from: CATALOG-ENT-0005
The system SHALL provide an index on item supporting lookup by product id.

#### Scenario: Item product index
ID: SWHM2-R-0008.01
- **GIVEN** items of many products
- **WHEN** items are looked up by product id
- **THEN** an index on the product id column supports the lookup

### Requirement: Database dialect selection
ID: SWHM2-R-0009
Recovered from: CATB-REQ-0009
The system SHALL select its catalog SQL dialect (Cloudscape or Oracle statements) by a configured database identifier, so that a new database needs only a new statement set and identifier.

#### Scenario: Database dialect selection
ID: SWHM2-R-0009.01
- **GIVEN** a configured database identifier
- **WHEN** the catalog starts
- **THEN** the statement set for that identifier is used

### Requirement: Storefront screens and populate tool
ID: SWHM2-R-0147
Recovered from: CAT-REQ-0001
The system SHALL provide storefront screens for categories, products, items and search, and a populate tool that loads catalog and customer sample data from XML into the database.

#### Scenario: Storefront screens and populate tool
ID: SWHM2-R-0147.01
- **GIVEN** the storefront
- **WHEN** a shopper browses
- **THEN** screens exist for categories, products, items and search; and the populate tool loads sample data from XML

### Requirement: Item localised record completeness
ID: SWHM2-R-0148
Recovered from: CATALOG-RULE-0001
The system SHALL require every item's localised record to carry a list price, a unit cost, an image and a description, and SHALL NOT enforce that the list price is at or above the unit cost.

#### Scenario: Item localised record completeness
ID: SWHM2-R-0148.01
- **GIVEN** an item with list price below unit cost
- **WHEN** it is stored
- **THEN** it is accepted

### Requirement: Item exposure
ID: SWHM2-R-0149
Recovered from: CB-BR-0005
The system SHALL expose each item with category, product id and name, item id, image location, description, five attributes, list price and unit cost.

#### Scenario: Item exposure
ID: SWHM2-R-0149.01
- **GIVEN** an item
- **WHEN** it is returned
- **THEN** it carries category, product id and name, item id, image, description, five attributes, list price and unit cost

### Requirement: Out-of-range paging
ID: SWHM2-R-0052
Recovered from: CATB-BR-0007
GIVEN a requested start offset that is negative or beyond the last row WHEN a list or search page is requested THEN the system SHALL return an empty page.

#### Scenario: Out-of-range paging
ID: SWHM2-R-0052.01
- **GIVEN** a requested start offset beyond the last row
- **WHEN** a list page is requested
- **THEN** an empty page is returned

### Requirement: Data store failure
ID: SWHM2-R-0053
Recovered from: CATB-BR-0010
GIVEN the catalog data store cannot be reached or a query fails WHEN any catalog operation runs THEN the system SHALL abort the request with a system error carrying the underlying message.

#### Scenario: Data store failure
ID: SWHM2-R-0053.01
- **GIVEN** an unreachable data store
- **WHEN** a catalog operation runs
- **THEN** the request aborts with a system error carrying the underlying message

### Requirement: Category listing
ID: SWHM2-R-0054
Recovered from: CATB-REQ-0001
The system SHALL return catalog categories ordered by name, in the customer's locale, as a page of at most the requested size starting at the requested offset.

#### Scenario: Category listing
ID: SWHM2-R-0054.01
- **GIVEN** categories in a locale
- **WHEN** a page is requested
- **THEN** categories are returned ordered by name, at most the page size, from the offset

### Requirement: Product listing
ID: SWHM2-R-0122
Recovered from: CATB-REQ-0002
The system SHALL list the products of a category ordered by name, in the customer's locale, paged by start offset and page size.

#### Scenario: Product listing
ID: SWHM2-R-0122.01
- **GIVEN** a category with products
- **WHEN** its products are requested
- **THEN** they are returned by name, paged

### Requirement: Item listing
ID: SWHM2-R-0055
Recovered from: CATB-REQ-0003
The system SHALL list the items of a product in the customer's locale with image, description, five attributes, list price and unit cost, paged by start offset and page size.

#### Scenario: Item listing
ID: SWHM2-R-0055.01
- **GIVEN** a product with items
- **WHEN** its items are requested
- **THEN** they are returned with image, description, attributes, list price and unit cost, paged; the order is not specified

### Requirement: Single entry lookup
ID: SWHM2-R-0056
Recovered from: CATB-REQ-0004
The system SHALL return a single category, product or item for a given id and locale, and SHALL return nothing (null) when no localized row exists.

#### Scenario: Single entry lookup
ID: SWHM2-R-0056.01
- **GIVEN** an id with no row in the requested locale
- **WHEN** the entry is requested
- **THEN** nothing is returned and no error is raised

### Requirement: Keyword search
ID: SWHM2-R-0123
Recovered from: CATB-REQ-0005
The system SHALL support keyword search over items, splitting the query on whitespace into distinct keywords and matching an item when ANY keyword is contained, case-insensitively, in the product name, category id or item description in the customer's locale.

#### Scenario: Keyword search
ID: SWHM2-R-0123.01
- **GIVEN** a query of two keywords
- **WHEN** a search is made
- **THEN** items matching either keyword in name, category id or description are returned regardless of case

### Requirement: Blank search
ID: SWHM2-R-0057
Recovered from: CATB-REQ-0006
GIVEN a search query that is empty or contains only whitespace WHEN a search is made THEN the system SHALL return an empty result page without querying the database.

#### Scenario: Blank search
ID: SWHM2-R-0057.01
- **GIVEN** a whitespace-only query
- **WHEN** a search is made
- **THEN** an empty page is returned and the database is not queried

### Requirement: Locale-aware keyword splitting
ID: SWHM2-R-0058
Recovered from: INTL-REQ-0006
The system SHALL split a search string into keywords using locale-aware word boundaries, discarding blank tokens.

#### Scenario: Locale-aware keyword splitting
ID: SWHM2-R-0058.01
- **GIVEN** a search string with blanks
- **WHEN** it is split
- **THEN** keywords follow locale word boundaries and blank tokens are discarded

