## 1. Data model

- [x] 1.1 Define sign-on credential (unique username max 50, mandatory password max 50) (SWHM2-T-0015; SWHM2-R-0005, SWHM2-R-0161)
- [x] 1.2 Define address, contact information and credit card entities with required fields (SWHM2-T-0015; SWHM2-R-0002, SWHM2-R-0159)
- [x] 1.3 Define account with status and required contact and credit card references (SWHM2-T-0015; SWHM2-R-0003, SWHM2-R-0064, SWHM2-R-0069)
- [x] 1.4 Define profile with language, optional favourite category, my-list and banner flags (SWHM2-T-0015; SWHM2-R-0010, SWHM2-R-0065)
- [x] 1.5 Define customer keyed by user id referencing sign-on, account and profile (SWHM2-T-0015; SWHM2-R-0004, SWHM2-R-0070, SWHM2-R-0064)

## 2. Account creation

- [x] 2.1 Validate new user ID and password length and forbidden characters (SWHM2-T-0015; SWHM2-R-0164)
- [x] 2.2 Create account as active with empty contact and credit card when none supplied (SWHM2-T-0015; SWHM2-R-0166, SWHM2-R-0069, SWHM2-R-0071)
- [x] 2.3 Create profile with default preferences (SWHM2-T-0015; SWHM2-R-0126, SWHM2-R-0071)
- [x] 2.4 Handle duplicate user name and failed creation with an error outcome (SWHM2-T-0015; SWHM2-R-0165)

## 3. Sign-on and session

- [x] 3.1 Intercept protected pages for unauthenticated users and remember the requested page (SWHM2-T-0015; SWHM2-R-0162)
- [x] 3.2 Authenticate by user name and password (SWHM2-T-0015; SWHM2-R-0029)
- [x] 3.3 Mark session signed on and redirect to the original page; failure goes to error page (SWHM2-T-0015; SWHM2-R-0163)
- [x] 3.4 Implement remember-user-name cookie of 31 days (SWHM2-T-0015; SWHM2-R-0068)
- [x] 3.5 Apply the customer's preferred language to session and cart at sign-on (SWHM2-T-0015; SWHM2-R-0067)
- [x] 3.6 End inactive sessions after 15 minutes (SWHM2-T-0015; SWHM2-R-0160)
- [x] 3.7 Record profile preferences from submitted options (SWHM2-T-0015; SWHM2-R-0066)
