## ADDED Requirements

### Requirement: Shell breadcrumb trail
ID: SWHM2-R-0198

The shell SHALL render a breadcrumb trail above pages more than one level deep, except on catalog pages, which render their own trail. Each crumb except the last SHALL be a link only when a page exists at its path.

#### Scenario: A catalog detail page shows one trail
ID: SWHM2-R-0198.01

- **GIVEN** the catalog holds item EST-24
- **WHEN** a user opens `/catalog/items/EST-24`
- **THEN** exactly one breadcrumb trail is shown, the page's own "Catalog path" trail

#### Scenario: Catalog search shows one trail
ID: SWHM2-R-0198.02

- **WHEN** a user opens `/catalog/search` with a keyword
- **THEN** exactly one breadcrumb trail is shown, the page's own "Catalog path" trail

#### Scenario: A path segment with no page is not a link
ID: SWHM2-R-0198.03

- **GIVEN** an order that the user can view
- **WHEN** the user opens `/checkout/orders/<id>`
- **THEN** the shell trail shows "Orders" as plain text, and no link in the trail leads to a missing page

#### Scenario: Other multi-level pages keep their shell trail
ID: SWHM2-R-0198.04

- **WHEN** a user opens `/admin/orders`
- **THEN** the shell trail "Home / Administration of orders / Orders" is shown, and its "Administration of orders" crumb links to `/admin`
