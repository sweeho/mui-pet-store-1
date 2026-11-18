---
ticket: SWHM2-T-0015
mockups: [SWHM2-MCK-27, SWHM2-MCK-28, SWHM2-MCK-29, SWHM2-MCK-30, SWHM2-MCK-31, SWHM2-MCK-32, SWHM2-MCK-33, SWHM2-MCK-34]
---
# Design check

Tokens changed to match the mockups (`design/tokens.mui.json`): primary #4f46e5 (light #eef2ff, dark #4338ca), error #dc2626,
info #0284c7, text #0f172a / #64748b, divider #e2e8f0, font Inter (loaded through `@fontsource-variable/inter`, family
`Inter Variable`), radius 4, buttons not capitalised and weight 600, body line heights 1.21 / 1.25. Before this ticket the
theme named Plus Jakarta Sans, which was never loaded, so the app fell back to Arial.

Differences common to every mockup below, left on purpose:
- Sidebar and logo ("Pet Store", "Shop", "Home", "Catalog", "Cart 2", "Inventory", "Orders", "Sales reports", "Prices in US$",
  "Signed out · Sign on" label): the mockup draws its own navigation. The shell's navigation (`src/shell/Sidebar.tsx`,
  `menu.ts`) belongs to the bootstrap capability and is not owned here (design.md D6); the sidebar width, logo size and item
  heights therefore differ (the `box` and `position` lines).
- Language switcher shows three buttons, the mockup a drop-down: inert in both, owned by SWHM2-I-0010 (design.md D4).
- "Inter" in the mockup, "Inter Variable" in the build: the same face, loaded from the variable font package.
- Breadcrumbs: the shell draws them from the URL ("Home / Accounts / Create"); the mockup draws "Home / Create account". `/accounts`
  redirects to `/account`.
- Sample data: the mockup pre-fills "jsmith" / "secret12" and says "Sign on to continue to Checkout"; the build shows the
  real (empty) fields and names the page the user asked for ("your account" for the manifest's `returnTo=/account`).
- Mobile: the built header keeps the shell's "Open the menu" button, and the footer wraps its two notes.

## SWHM2-MCK-27 · Sign on (/signon?returnTo=%2Faccount, signed out, 1440)
![mockup](design-check/SWHM2-MCK-27-mockup.png) ![built](design-check/SWHM2-MCK-27-built.png)
![diff](design-check/SWHM2-MCK-27-diff.png)
Measured: 6.4% of pixels differ, 91 differences (first run on the template tokens: 100+). Page height mockup 900px, built 900px.
Differences left:
- The shell and sample-data differences listed above.
- Content line boxes: the mockup's text uses the browser's normal line height, MUI Typography sets its own (a few px taller): spacing between blocks moves by up to 14px; the order and hierarchy are the same.
- Checkbox and "Show password" button: MUI draws its own icon sizes inside a 16px/40x36 box; the mockup uses native controls.

## SWHM2-MCK-28 · Sign on · Mobile (/signon?returnTo=%2Faccount, signed out, 390)
![mockup](design-check/SWHM2-MCK-28-mockup.png) ![built](design-check/SWHM2-MCK-28-built.png)
![diff](design-check/SWHM2-MCK-28-diff.png)
Measured: 15.8% of pixels differ, 61 differences (first run on the template tokens: 100+). Page height mockup 900px, built 900px.
Differences left:
- The shell and sample-data differences listed above.
- Content line boxes: the mockup's text uses the browser's normal line height, MUI Typography sets its own (a few px taller): spacing between blocks moves by up to 14px; the order and hierarchy are the same.
- Checkbox and "Show password" button: MUI draws its own icon sizes inside a 16px/40x36 box; the mockup uses native controls.

## SWHM2-MCK-29 · Sign-on error (/signon/error, 1440)
![mockup](design-check/SWHM2-MCK-29-mockup.png) ![built](design-check/SWHM2-MCK-29-built.png)
![diff](design-check/SWHM2-MCK-29-diff.png)
Measured: 4.8% of pixels differ, 79 differences (first run on the template tokens: 100+). Page height mockup 900px, built 900px.
Differences left:
- The shell and sample-data differences listed above.
- Content line boxes: the mockup's text uses the browser's normal line height, MUI Typography sets its own (a few px taller): spacing between blocks moves by up to 14px; the order and hierarchy are the same.
- Checkbox and "Show password" button: MUI draws its own icon sizes inside a 16px/40x36 box; the mockup uses native controls.

## SWHM2-MCK-30 · Sign-on error · Mobile (/signon/error, 390)
![mockup](design-check/SWHM2-MCK-30-mockup.png) ![built](design-check/SWHM2-MCK-30-built.png)
![diff](design-check/SWHM2-MCK-30-diff.png)
Measured: 13.3% of pixels differ, 59 differences (first run on the template tokens: 100+). Page height mockup 900px, built 900px.
Differences left:
- The shell and sample-data differences listed above.
- Content line boxes: the mockup's text uses the browser's normal line height, MUI Typography sets its own (a few px taller): spacing between blocks moves by up to 14px; the order and hierarchy are the same.
- Checkbox and "Show password" button: MUI draws its own icon sizes inside a 16px/40x36 box; the mockup uses native controls.

## SWHM2-MCK-31 · Create account (/accounts/create, 1440)
![mockup](design-check/SWHM2-MCK-31-mockup.png) ![built](design-check/SWHM2-MCK-31-built.png)
![diff](design-check/SWHM2-MCK-31-diff.png)
Measured: 6.2% of pixels differ, 115 differences (first run on the template tokens: 100+). Page height mockup 900px, built 900px.
Differences left:
- The shell and sample-data differences listed above.
- Content line boxes: the mockup's text uses the browser's normal line height, MUI Typography sets its own (a few px taller): spacing between blocks moves by up to 14px; the order and hierarchy are the same.
- Checkbox and "Show password" button: MUI draws its own icon sizes inside a 16px/40x36 box; the mockup uses native controls.

## SWHM2-MCK-32 · Create account · Mobile (/accounts/create, 390)
![mockup](design-check/SWHM2-MCK-32-mockup.png) ![built](design-check/SWHM2-MCK-32-built.png)
![diff](design-check/SWHM2-MCK-32-diff.png)
Measured: 15.8% of pixels differ, 103 differences (first run on the template tokens: 100+). Page height mockup 1097px, built 1106px.
Differences left:
- The shell and sample-data differences listed above.
- Content line boxes: the mockup's text uses the browser's normal line height, MUI Typography sets its own (a few px taller): spacing between blocks moves by up to 14px; the order and hierarchy are the same.
- Checkbox and "Show password" button: MUI draws its own icon sizes inside a 16px/40x36 box; the mockup uses native controls.

## SWHM2-MCK-33 · User creation error (/accounts/create-error, 1440)
![mockup](design-check/SWHM2-MCK-33-mockup.png) ![built](design-check/SWHM2-MCK-33-built.png)
![diff](design-check/SWHM2-MCK-33-diff.png)
Measured: 5.1% of pixels differ, 82 differences (first run on the template tokens: 100+). Page height mockup 900px, built 900px.
Differences left:
- The shell and sample-data differences listed above.
- Content line boxes: the mockup's text uses the browser's normal line height, MUI Typography sets its own (a few px taller): spacing between blocks moves by up to 14px; the order and hierarchy are the same.
- Checkbox and "Show password" button: MUI draws its own icon sizes inside a 16px/40x36 box; the mockup uses native controls.

## SWHM2-MCK-34 · User creation error · Mobile (/accounts/create-error, 390)
![mockup](design-check/SWHM2-MCK-34-mockup.png) ![built](design-check/SWHM2-MCK-34-built.png)
![diff](design-check/SWHM2-MCK-34-diff.png)
Measured: 16.2% of pixels differ, 62 differences (first run on the template tokens: 100+). Page height mockup 900px, built 900px.
Differences left:
- The shell and sample-data differences listed above.
- Content line boxes: the mockup's text uses the browser's normal line height, MUI Typography sets its own (a few px taller): spacing between blocks moves by up to 14px; the order and hierarchy are the same.
- Checkbox and "Show password" button: MUI draws its own icon sizes inside a 16px/40x36 box; the mockup uses native controls.

