# site-shell Specification

## Purpose

TBD - created by archiving change swhm2-i-0001-bootstrap-landing-page-and. Update Purpose after archive.

## Requirements

### Requirement: Landing page

ID: SWHM2-R-0194

The application SHALL serve a landing page at its root route that introduces the product and links to every primary area.

#### Scenario: A user opens the root route

ID: SWHM2-R-0194.01

- **WHEN** a user opens the application's root URL
- **THEN** the landing page is shown
- **AND** it links to every primary area of the application

### Requirement: Global navigation

ID: SWHM2-R-0195

The application SHALL render one global navigation on every page, with an entry for each primary area and a link back to the landing page.

#### Scenario: Navigation is present on every page

ID: SWHM2-R-0195.01

- **WHEN** a user opens any page
- **THEN** the global navigation is shown
- **AND** it includes a link back to the landing page

### Requirement: Shared page layout

ID: SWHM2-R-0196

The application SHALL render every page inside one shared layout with a common header and footer.

#### Scenario: A page renders inside the shell

ID: SWHM2-R-0196.01

- **WHEN** a user opens any page
- **THEN** the page content renders inside the shared header, navigation and footer

### Requirement: Shared state frames

ID: SWHM2-R-0197

The application SHALL provide shared empty, error and loading frames that every page reuses.

#### Scenario: A page has nothing to show

ID: SWHM2-R-0197.01

- **WHEN** a page has no data to display
- **THEN** it renders the shared empty frame

#### Scenario: A page fails to load

ID: SWHM2-R-0197.02

- **WHEN** a page's data cannot be loaded
- **THEN** it renders the shared error frame with a way to retry

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
