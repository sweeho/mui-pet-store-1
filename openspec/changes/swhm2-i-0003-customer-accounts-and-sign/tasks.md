## 1. Data model

- [ ] 1.1 Define sign-on credential (unique username max 50, mandatory password max 50)
- [ ] 1.2 Define address, contact information and credit card entities with required fields
- [ ] 1.3 Define account with status and required contact and credit card references
- [ ] 1.4 Define profile with language, optional favourite category, my-list and banner flags
- [ ] 1.5 Define customer keyed by user id referencing sign-on, account and profile

## 2. Account creation

- [ ] 2.1 Validate new user ID and password length and forbidden characters
- [ ] 2.2 Create account as active with empty contact and credit card when none supplied
- [ ] 2.3 Create profile with default preferences
- [ ] 2.4 Handle duplicate user name and failed creation with an error outcome

## 3. Sign-on and session

- [ ] 3.1 Intercept protected pages for unauthenticated users and remember the requested page
- [ ] 3.2 Authenticate by user name and password
- [ ] 3.3 Mark session signed on and redirect to the original page; failure goes to error page
- [ ] 3.4 Implement remember-user-name cookie of 31 days
- [ ] 3.5 Apply the customer's preferred language to session and cart at sign-on
- [ ] 3.6 End inactive sessions after 15 minutes
- [ ] 3.7 Record profile preferences from submitted options
