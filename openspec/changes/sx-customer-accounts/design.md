# Legacy implementation notes: customer-accounts

## User interface
No screen records were extracted for this capability; its user interface is unspecified. Sign-on, user creation and error pages are referenced only through their redirect behaviour.

## How the legacy application implements it
- Sign-on: a servlet filter (SignOnFilter) matches the target URL by exact string equality against patterns in /WEB-INF/signon-config.xml (not seen), stores the original URL in the session and forwards to the sign-on page. Authentication runs in SignOnEJB.authenticate, which finds UserEJB by primary key and calls matchPassword (String.equals, plain text).
- Remember-me: cookie of 2678400 seconds (31 days); otherwise the cookie is expired.
- User creation: validation of user ID length (25), password length and '%' / '*' characters; duplicate names fail on the primary key and redirect to an error page.
- Customer creation: the customer EJB creates an account (status active) and a profile (defaults en_US, no favourite category, my-list on, banner on); empty contact info and credit card are created when none are supplied.
- Session timeout of 15 minutes comes from the web application deployment descriptor.
- Schema constraints: customer user id equals a unique sign-on user name; account references contact and credit card; contact references address. Passwords and card numbers are stored unencrypted.

## Open points
- The protected URL list is not in the analysed module (CUST-REQ-0001).
- Plain-text password storage is a suspected legacy defect; the Business Owner decides in the defect register.
- The pass files disagree on some wording; records here follow the consolidated IR statements.
