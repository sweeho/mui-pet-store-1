## MODIFIED Requirements

### Requirement: Storefront screens and populate tool

The system SHALL provide storefront screens for categories, products, items and search, and a populate tool that loads catalog and customer sample data from XML into the database. In a production configuration the populate tool SHALL load data only for a caller with an administrator session.

#### Scenario: Storefront screens and populate tool

- **GIVEN** the storefront
- **WHEN** a shopper browses
- **THEN** screens exist for categories, products, items and search; and the populate tool loads sample data from XML

#### Scenario: An anonymous caller is refused in production

- **GIVEN** the application runs in a production configuration
- **WHEN** a caller with no administrator session posts to the populate endpoint
- **THEN** the response is 401 and no catalog row is written

#### Scenario: An administrator loads the sample data in production

- **GIVEN** the application runs in a production configuration
- **WHEN** a caller with an administrator session posts to the populate endpoint
- **THEN** the sample catalog is loaded and the response reports the loaded counts

#### Scenario: Any caller loads the sample data outside production

- **GIVEN** the application runs in a development or test configuration
- **WHEN** a caller with no administrator session posts to the populate endpoint
- **THEN** the sample catalog is loaded and the response reports the loaded counts

#### Scenario: The empty catalog does not advertise the endpoint

- **GIVEN** the catalog holds no categories
- **WHEN** a user opens `/catalog`
- **THEN** the empty frame says the catalog is empty and does not mention the populate endpoint
