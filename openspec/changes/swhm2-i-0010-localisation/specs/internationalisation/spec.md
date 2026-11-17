## ADDED Requirements

### Requirement: Shift-JIS and JIS parameter conversion
ID: SWHM2-R-0167
Recovered from: INTL-REQ-0007
The system SHALL convert a URL-encoded Shift-JIS or JIS parameter value into a Unicode string, trimming surrounding whitespace.

#### Scenario: Encoded value converted
ID: SWHM2-R-0167.01
- **GIVEN** a URL-encoded Shift-JIS value with surrounding whitespace
- **WHEN** it is converted
- **THEN** the trimmed Unicode string is returned

### Requirement: Admin client text bundles
ID: SWHM2-R-0168
Recovered from: ADM-REQ-0005
The system SHALL render the admin rich client text from resource bundles, with a default and a German variant provided.

#### Scenario: German bundle selected
ID: SWHM2-R-0168.01
- **GIVEN** the admin client running with a German locale
- **WHEN** a panel is rendered
- **THEN** its text comes from the German bundle, otherwise from the default bundle

### Requirement: Locale-aware number and currency formatting
ID: SWHM2-R-0006
Recovered from: INTL-REQ-0005
The system SHALL format currency amounts and numbers for a given locale with a caller-specified number of decimal places, optionally using a caller-specified pattern.

#### Scenario: Amount formatted
ID: SWHM2-R-0006.01
- **GIVEN** an amount, a locale and 2 decimal places
- **WHEN** it is formatted as currency
- **THEN** the result follows the locale's conventions with 2 decimals

### Requirement: Locale text parsing
ID: SWHM2-R-0072
Recovered from: CB-REQ-0005
The system SHALL interpret a locale given as text of the form language_country, and the word "default" as the server default locale.

#### Scenario: Language and country text
ID: SWHM2-R-0072.01
- **GIVEN** the text "ja_JP"
- **WHEN** it is interpreted
- **THEN** the Japanese (Japan) locale is returned

#### Scenario: Default keyword
ID: SWHM2-R-0072.02
- **GIVEN** the text "default"
- **WHEN** it is interpreted
- **THEN** the server default locale is returned

### Requirement: Customer preferred language
ID: SWHM2-R-0073
Recovered from: CUSTOMER-ACCOUNTS-REQUIREMENT-0001
The system SHALL store a preferred language per customer profile.

#### Scenario: Preferred language saved
ID: SWHM2-R-0073.01
- **GIVEN** a customer profile
- **WHEN** a preferred language is set and saved
- **THEN** the profile returns that language when read

### Requirement: Storefront languages
ID: SWHM2-R-0074
Recovered from: I18N-REQ-0001
The system SHALL serve storefront screens in English, Japanese and Chinese, with separate screen definitions and page sets per locale, and SHALL allow the shopper to change the locale.

#### Scenario: Japanese storefront
ID: SWHM2-R-0074.01
- **GIVEN** a shopper whose locale is Japanese
- **WHEN** a storefront screen is requested
- **THEN** the Japanese screen definition and page set are used

### Requirement: Invalid locale change rejected
ID: SWHM2-R-0075
Recovered from: INTL-BR-0002
The system SHALL reject a locale-change request whose locale value is missing or not of the form language_country, with an error stating it was unable to change the language, and SHALL leave the current locale unchanged.

#### Scenario: Missing locale
ID: SWHM2-R-0075.01
- **GIVEN** a shopper with locale en_US
- **WHEN** a change-locale request arrives with no locale value
- **THEN** an unable-to-change-language error is returned and the locale stays en_US

### Requirement: Locale change by request
ID: SWHM2-R-0076
Recovered from: INTL-REQ-0001
The system SHALL let a user change the language of the storefront by submitting a locale code, and SHALL keep the chosen locale for the rest of the session and raise a change-locale event for the back end.

#### Scenario: Valid locale submitted
ID: SWHM2-R-0076.01
- **GIVEN** a shopper in an active session
- **WHEN** locale code "ja_JP" is submitted
- **THEN** the session locale becomes ja_JP and a change-locale event is raised

### Requirement: Locale-specific catalog content
ID: SWHM2-R-0127
Recovered from: CATB-REQ-0008
The system SHALL serve all catalog names, descriptions and item images from locale-specific detail rows keyed by the customer's locale.

#### Scenario: Catalog in Chinese
ID: SWHM2-R-0127.01
- **GIVEN** a customer with locale zh_CN
- **WHEN** a catalog item is displayed
- **THEN** its name, description and image come from the zh_CN detail row

### Requirement: Default locale on first request
ID: SWHM2-R-0128
Recovered from: INTL-BR-0003
The system SHALL give a visitor with no chosen language the configured default locale (en_US) on first request.

#### Scenario: First visit
ID: SWHM2-R-0128.01
- **GIVEN** a visitor with no session locale
- **WHEN** the first request is processed
- **THEN** the session locale is en_US

### Requirement: Screen definition resolution and fallback
ID: SWHM2-R-0129
Recovered from: INTL-BR-0004
The system SHALL render each screen from the screen definitions of the requested locale, where an explicit "locale" request parameter overrides the session locale; GIVEN the locale has no screen definitions, or lacks the screen, WHEN the screen is requested, THEN the system SHALL render the default-locale definition of that screen.

#### Scenario: Parameter overrides session
ID: SWHM2-R-0129.01
- **GIVEN** a session locale of en_US
- **WHEN** a screen is requested with locale parameter ja_JP
- **THEN** the Japanese definition is used

#### Scenario: Screen missing in locale
ID: SWHM2-R-0129.02
- **GIVEN** a locale lacking the requested screen
- **WHEN** the screen is requested
- **THEN** the default-locale definition is rendered
