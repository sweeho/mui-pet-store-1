## ADDED Requirements

### Requirement: Shift-JIS and JIS parameter conversion
Recovered from: INTL-REQ-0007
The system SHALL convert a URL-encoded Shift-JIS or JIS parameter value into a Unicode string, trimming surrounding whitespace.

#### Scenario: Encoded value converted
- **GIVEN** a URL-encoded Shift-JIS value with surrounding whitespace
- **WHEN** it is converted
- **THEN** the trimmed Unicode string is returned

### Requirement: Admin client text bundles
Recovered from: ADM-REQ-0005
The system SHALL render the admin rich client text from resource bundles, with a default and a German variant provided.

#### Scenario: German bundle selected
- **GIVEN** the admin client running with a German locale
- **WHEN** a panel is rendered
- **THEN** its text comes from the German bundle, otherwise from the default bundle

### Requirement: Locale-aware number and currency formatting
ID: SWHM2-R-0006
Recovered from: INTL-REQ-0005
The system SHALL format currency amounts and numbers for a given locale with a caller-specified number of decimal places, optionally using a caller-specified pattern.

#### Scenario: Amount formatted
- **GIVEN** an amount, a locale and 2 decimal places
- **WHEN** it is formatted as currency
- **THEN** the result follows the locale's conventions with 2 decimals

### Requirement: Locale text parsing
Recovered from: CB-REQ-0005
The system SHALL interpret a locale given as text of the form language_country, and the word "default" as the server default locale.

#### Scenario: Language and country text
- **GIVEN** the text "ja_JP"
- **WHEN** it is interpreted
- **THEN** the Japanese (Japan) locale is returned

#### Scenario: Default keyword
- **GIVEN** the text "default"
- **WHEN** it is interpreted
- **THEN** the server default locale is returned

### Requirement: Customer preferred language
Recovered from: CUSTOMER-ACCOUNTS-REQUIREMENT-0001
The system SHALL store a preferred language per customer profile.

#### Scenario: Preferred language saved
- **GIVEN** a customer profile
- **WHEN** a preferred language is set and saved
- **THEN** the profile returns that language when read

### Requirement: Storefront languages
Recovered from: I18N-REQ-0001
The system SHALL serve storefront screens in English, Japanese and Chinese, with separate screen definitions and page sets per locale, and SHALL allow the shopper to change the locale.

#### Scenario: Japanese storefront
- **GIVEN** a shopper whose locale is Japanese
- **WHEN** a storefront screen is requested
- **THEN** the Japanese screen definition and page set are used

### Requirement: Invalid locale change rejected
Recovered from: INTL-BR-0002
The system SHALL reject a locale-change request whose locale value is missing or not of the form language_country, with an error stating it was unable to change the language, and SHALL leave the current locale unchanged.

#### Scenario: Missing locale
- **GIVEN** a shopper with locale en_US
- **WHEN** a change-locale request arrives with no locale value
- **THEN** an unable-to-change-language error is returned and the locale stays en_US

### Requirement: Locale change by request
Recovered from: INTL-REQ-0001
The system SHALL let a user change the language of the storefront by submitting a locale code, and SHALL keep the chosen locale for the rest of the session and raise a change-locale event for the back end.

#### Scenario: Valid locale submitted
- **GIVEN** a shopper in an active session
- **WHEN** locale code "ja_JP" is submitted
- **THEN** the session locale becomes ja_JP and a change-locale event is raised

### Requirement: Locale-specific catalog content
Recovered from: CATB-REQ-0008
The system SHALL serve all catalog names, descriptions and item images from locale-specific detail rows keyed by the customer's locale.

#### Scenario: Catalog in Chinese
- **GIVEN** a customer with locale zh_CN
- **WHEN** a catalog item is displayed
- **THEN** its name, description and image come from the zh_CN detail row

### Requirement: Default locale on first request
Recovered from: INTL-BR-0003
The system SHALL give a visitor with no chosen language the configured default locale (en_US) on first request.

#### Scenario: First visit
- **GIVEN** a visitor with no session locale
- **WHEN** the first request is processed
- **THEN** the session locale is en_US

### Requirement: Screen definition resolution and fallback
Recovered from: INTL-BR-0004
The system SHALL render each screen from the screen definitions of the requested locale, where an explicit "locale" request parameter overrides the session locale; GIVEN the locale has no screen definitions, or lacks the screen, WHEN the screen is requested, THEN the system SHALL render the default-locale definition of that screen.

#### Scenario: Parameter overrides session
- **GIVEN** a session locale of en_US
- **WHEN** a screen is requested with locale parameter ja_JP
- **THEN** the Japanese definition is used

#### Scenario: Screen missing in locale
- **GIVEN** a locale lacking the requested screen
- **WHEN** the screen is requested
- **THEN** the default-locale definition is rendered
