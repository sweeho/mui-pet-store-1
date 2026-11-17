## ADDED Requirements

### Requirement: Contact information storage
ID: SWHM2-R-0002
Recovered from: CUS-ENT-0004
The system SHALL store contact information with required family name, given name, telephone and email, and a required reference to an existing address.

#### Scenario: Primary case
ID: SWHM2-R-0002.01
- **GIVEN** a contact with family name, given name, telephone, email and an existing address
- **WHEN** it is stored
- **THEN** it is accepted

#### Scenario: Alternative case
ID: SWHM2-R-0002.02
- **GIVEN** a contact missing the telephone
- **WHEN** it is stored
- **THEN** it is rejected

### Requirement: Account storage
ID: SWHM2-R-0003
Recovered from: CUS-ENT-0006
The system SHALL store an account with a required status and required references to an existing contact and an existing credit card.

#### Scenario: Primary case
ID: SWHM2-R-0003.01
- **GIVEN** an account with a status, an existing contact and an existing credit card
- **WHEN** it is stored
- **THEN** it is accepted

#### Scenario: Alternative case
ID: SWHM2-R-0003.02
- **GIVEN** an account referencing a non-existent credit card
- **WHEN** it is stored
- **THEN** it is rejected

### Requirement: Customer record references
ID: SWHM2-R-0004
Recovered from: CUS-ENT-0007
The system SHALL store one customer per sign-on user name, each referencing exactly one existing sign-on user, one account and one profile.

#### Scenario: Primary case
ID: SWHM2-R-0004.01
- **GIVEN** a customer referencing an existing sign-on user, account and profile
- **WHEN** it is stored
- **THEN** it is accepted

#### Scenario: Alternative case
ID: SWHM2-R-0004.02
- **GIVEN** a second customer for the same sign-on user name
- **WHEN** it is stored
- **THEN** it is rejected

### Requirement: Sign-on credential storage
ID: SWHM2-R-0005
Recovered from: CUSTOMER-ACCOUNTS-ENT-0001
The system SHALL store one sign-on credential per username, with a non-empty username (max 50 chars) as unique key and a mandatory password (max 50 chars).

#### Scenario: Primary case
ID: SWHM2-R-0005.01
- **GIVEN** an existing sign-on credential for username jsmith
- **WHEN** a credential for jsmith is stored again
- **THEN** it is rejected

#### Scenario: Alternative case
ID: SWHM2-R-0005.02
- **GIVEN** a credential with an empty password
- **WHEN** it is stored
- **THEN** it is rejected

### Requirement: Profile storage
ID: SWHM2-R-0010
Recovered from: CUSTOMER-ACCOUNTS-ENT-0002
The system SHALL keep one profile per profile id holding a mandatory preferred language, an optional favorite category, and mandatory my-list and banner preference flags.

#### Scenario: Primary case
ID: SWHM2-R-0010.01
- **GIVEN** a profile with language, my-list flag and banner flag but no favorite category
- **WHEN** it is stored
- **THEN** it is accepted

#### Scenario: Alternative case
ID: SWHM2-R-0010.02
- **GIVEN** a profile without a preferred language
- **WHEN** it is stored
- **THEN** it is rejected

### Requirement: Inactive session timeout
ID: SWHM2-R-0160
Recovered from: ACCT-REQ-0005
The system SHALL end an inactive customer web session after 15 minutes.

#### Scenario: Primary case
ID: SWHM2-R-0160.01
- **GIVEN** a customer session idle for 15 minutes
- **WHEN** the next request arrives
- **THEN** the session has ended

#### Scenario: Alternative case
ID: SWHM2-R-0160.02
- **GIVEN** a customer session idle for less than 15 minutes
- **WHEN** the next request arrives
- **THEN** the session is still active

### Requirement: Contact and address required fields
ID: SWHM2-R-0159
Recovered from: ACCT-REQ-0001
The system SHALL require, for every contact record, a family name, given name, telephone, e-mail and address, and for every address a first street line, city, state, zip code and country, with only the second street line optional.

#### Scenario: Primary case
ID: SWHM2-R-0159.01
- **GIVEN** an address without a second street line
- **WHEN** it is stored
- **THEN** it is accepted

#### Scenario: Alternative case
ID: SWHM2-R-0159.02
- **GIVEN** an address without a city
- **WHEN** it is stored
- **THEN** it is rejected

### Requirement: Plain text sign-on passwords
ID: SWHM2-R-0161
Recovered from: ACCT-RULE-0001
The system SHALL store sign-on passwords as plain text and SHALL permit at most one sign-on record per user name.

#### Scenario: Primary case
ID: SWHM2-R-0161.01
- **GIVEN** a new sign-on record with password secret1
- **WHEN** it is stored
- **THEN** the password is held as supplied

#### Scenario: Alternative case
ID: SWHM2-R-0161.02
- **GIVEN** an existing sign-on record for the user name
- **WHEN** another record with the same user name is stored
- **THEN** it is rejected

### Requirement: Protected page interception
ID: SWHM2-R-0162
Recovered from: CUST-REQ-0001
The system SHALL intercept a request for a protected page from a user who is not signed on and present the sign-on page instead, remembering the originally requested page.

#### Scenario: Primary case
ID: SWHM2-R-0162.01
- **GIVEN** a user who is not signed on
- **WHEN** a protected page is requested
- **THEN** the sign-on page is presented and the requested page is remembered

#### Scenario: Alternative case
ID: SWHM2-R-0162.02
- **GIVEN** a signed-on user
- **WHEN** a protected page is requested
- **THEN** the page is served

### Requirement: Sign-on authentication
ID: SWHM2-R-0029
Recovered from: CUST-REQ-0002
The system SHALL authenticate a sign-on attempt by looking up the user by name and comparing the supplied password to the stored password for exact equality; an unknown user name SHALL fail authentication.

#### Scenario: Primary case
ID: SWHM2-R-0029.01
- **GIVEN** an existing user with a stored password
- **WHEN** the same password is supplied
- **THEN** authentication succeeds

#### Scenario: Alternative case
ID: SWHM2-R-0029.02
- **GIVEN** an unknown user name
- **WHEN** a sign-on is attempted
- **THEN** authentication fails

### Requirement: Sign-on outcome
ID: SWHM2-R-0163
Recovered from: CUST-REQ-0003
GIVEN a successful sign-on WHEN authentication succeeds THEN the system SHALL mark the session as signed on, record the user name in the session and redirect to the originally requested page; GIVEN a failed sign-on THEN the system SHALL redirect to the configured sign-on error page.

#### Scenario: Primary case
ID: SWHM2-R-0163.01
- **GIVEN** a successful authentication
- **WHEN** sign-on completes
- **THEN** the session is marked signed on, the user name is recorded and the user is redirected to the originally requested page

#### Scenario: Alternative case
ID: SWHM2-R-0163.02
- **GIVEN** a failed authentication
- **WHEN** sign-on completes
- **THEN** the user is redirected to the sign-on error page

### Requirement: New user validation
ID: SWHM2-R-0164
Recovered from: CUST-REQ-0005
The system SHALL reject creation of a user whose user ID exceeds 25 characters, whose password exceeds the maximum password length, or whose user ID contains '%' or '*'.

#### Scenario: Primary case
ID: SWHM2-R-0164.01
- **GIVEN** a user ID of 26 characters
- **WHEN** user creation is requested
- **THEN** creation is rejected

#### Scenario: Alternative case
ID: SWHM2-R-0164.02
- **GIVEN** a user ID containing '*'
- **WHEN** user creation is requested
- **THEN** creation is rejected

### Requirement: Failed user creation
ID: SWHM2-R-0165
Recovered from: CUST-REQ-0006
GIVEN a duplicate user name or a failed creation WHEN account creation fails THEN the system SHALL redirect to the user creation error page; the user name is the unique identifier of an account.

#### Scenario: Primary case
ID: SWHM2-R-0165.01
- **GIVEN** an existing user name
- **WHEN** a new account with that name is created
- **THEN** the user is redirected to the user creation error page

#### Scenario: Alternative case
ID: SWHM2-R-0165.02
- **GIVEN** a creation failure
- **WHEN** account creation fails
- **THEN** the user is redirected to the user creation error page

### Requirement: Account contents
ID: SWHM2-R-0166
Recovered from: CUSTOMER-ACCOUNTS-ENTITY-0002
The system SHALL keep for each account its status, one contact-information record and one credit card record, created empty when the account is created without them.

#### Scenario: Primary case
ID: SWHM2-R-0166.01
- **GIVEN** an account created without contact information or credit card
- **WHEN** creation completes
- **THEN** empty contact information and credit card records exist for it

#### Scenario: Alternative case
ID: SWHM2-R-0166.02
- **GIVEN** an account created with contact information and credit card
- **WHEN** creation completes
- **THEN** the supplied records are kept

### Requirement: Customer, account and contact chain
ID: SWHM2-R-0064
Recovered from: ACCT-ENT-0001
The system SHALL store a customer as a registered shopper whose user id equals a unique sign-on user name, linked to exactly one account and one profile; the account SHALL link to one contact record and one payment card, and the contact record SHALL link to one postal address.

#### Scenario: Primary case
ID: SWHM2-R-0064.01
- **GIVEN** a registered shopper
- **WHEN** the shopper is stored
- **THEN** the user id equals a sign-on user name and links to one account and one profile

#### Scenario: Alternative case
ID: SWHM2-R-0064.02
- **GIVEN** an account
- **WHEN** it is stored
- **THEN** it links to one contact record, one payment card, and the contact to one postal address

### Requirement: Profile attributes
ID: SWHM2-R-0065
Recovered from: ACCT-REQ-0002
The system SHALL store each customer profile with a preferred language, an optional favourite category, a my-list preference flag and a banner preference flag.

#### Scenario: Primary case
ID: SWHM2-R-0065.01
- **GIVEN** a customer profile
- **WHEN** it is stored
- **THEN** it holds language, optional favourite category, my-list flag and banner flag

#### Scenario: Alternative case
ID: SWHM2-R-0065.02
- **GIVEN** a profile without a favourite category
- **WHEN** it is stored
- **THEN** it is accepted

### Requirement: Profile preference recording
ID: SWHM2-R-0066
Recovered from: ACCT-REQ-0003
The system SHALL record on a customer profile the preferred language, favourite category, and on/off preferences for the personal list and for banners (off when the option is not submitted).

#### Scenario: Primary case
ID: SWHM2-R-0066.01
- **GIVEN** a profile submission without the banner option
- **WHEN** the profile is recorded
- **THEN** the banner preference is off

#### Scenario: Alternative case
ID: SWHM2-R-0066.02
- **GIVEN** a submission with all options
- **WHEN** the profile is recorded
- **THEN** each preference is recorded as submitted

### Requirement: Language applied at sign-on
ID: SWHM2-R-0067
Recovered from: ACCT-REQ-0004
The system SHALL, at sign-on, associate the user name with the session and set the session language and the cart language from the customer's preferred language; a customer without a stored profile keeps the current language.

#### Scenario: Primary case
ID: SWHM2-R-0067.01
- **GIVEN** a customer whose preferred language is ja_JP
- **WHEN** the customer signs on
- **THEN** the session language and cart language are ja_JP

#### Scenario: Alternative case
ID: SWHM2-R-0067.02
- **GIVEN** a customer without a stored profile
- **WHEN** the customer signs on
- **THEN** the current language is kept

### Requirement: Remember user name cookie
ID: SWHM2-R-0068
Recovered from: CUST-REQ-0004
GIVEN the user ticks "remember user name" at sign-on THEN the system SHALL store the user name in a cookie lasting 2678400 seconds (31 days); OTHERWISE any existing remember-me cookie SHALL be expired.

#### Scenario: Primary case
ID: SWHM2-R-0068.01
- **GIVEN** the remember option is ticked
- **WHEN** the user signs on
- **THEN** a cookie with the user name lasting 2678400 seconds is stored

#### Scenario: Alternative case
ID: SWHM2-R-0068.02
- **GIVEN** the remember option is not ticked and a cookie exists
- **WHEN** the user signs on
- **THEN** the cookie is expired

### Requirement: Account statuses
ID: SWHM2-R-0069
Recovered from: CUSTOMER-ACCOUNTS-BUSINESS-RULE-0001
The system SHALL support account statuses "active" and "disabled", and SHALL create new accounts as "active".

#### Scenario: Primary case
ID: SWHM2-R-0069.01
- **GIVEN** a new account
- **WHEN** it is created
- **THEN** its status is active

#### Scenario: Alternative case
ID: SWHM2-R-0069.02
- **GIVEN** an account with status disabled
- **WHEN** its status is read
- **THEN** it is disabled

### Requirement: Customer identifier
ID: SWHM2-R-0070
Recovered from: CUSTOMER-ACCOUNTS-ENTITY-0001
The system SHALL identify each customer by a single user identifier that is the primary key of the customer record.

#### Scenario: Primary case
ID: SWHM2-R-0070.01
- **GIVEN** a customer with user identifier jsmith
- **WHEN** another customer with identifier jsmith is stored
- **THEN** it is rejected

#### Scenario: Alternative case
ID: SWHM2-R-0070.02
- **GIVEN** two customers with different identifiers
- **WHEN** they are stored
- **THEN** both are accepted

### Requirement: Customer creation attaches account and profile
ID: SWHM2-R-0071
Recovered from: CUSTOMER-ACCOUNTS-WORKFLOW-0001
GIVEN a new customer is created WHEN creation completes THEN the system SHALL attach an account with status "active" and a profile holding default preferences.

#### Scenario: Primary case
ID: SWHM2-R-0071.01
- **GIVEN** a new customer
- **WHEN** creation completes
- **THEN** an active account and a default profile are attached

#### Scenario: Alternative case
ID: SWHM2-R-0071.02
- **GIVEN** a new customer
- **WHEN** creation completes
- **THEN** no customer exists without an account and a profile

### Requirement: Default profile preferences
ID: SWHM2-R-0126
Recovered from: CUSTOMER-ACCOUNTS-BUSINESS-RULE-0002
The system SHALL give every new profile the defaults language en_US, no favourite category, my-list preference on and banner preference on.

#### Scenario: Primary case
ID: SWHM2-R-0126.01
- **GIVEN** a new profile created without preferences
- **WHEN** creation completes
- **THEN** language is en_US, favourite category is empty, my-list is on and banner is on

#### Scenario: Alternative case
ID: SWHM2-R-0126.02
- **GIVEN** a new profile created with preferences
- **WHEN** creation completes
- **THEN** the supplied preferences are kept
