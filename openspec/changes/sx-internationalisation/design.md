# Design notes: legacy implementation of internationalisation

## User interface
No screen records were extracted for this capability; its user interface is unspecified.

## Legacy implementation notes
- Locale change: a change-locale action reads the `locale` request parameter, parses `language_country` by hand (null when absent or lacking an underscore; the word "default" maps to the server default), stores it in the session and raises a change-locale event for the back end. A null result throws an error shown as unable to change the language.
- Default locale: the main servlet sets the session locale from init-param `default_locale=en_US` when none is set. The user guide says language follows the browser setting; that is not implemented here (suspected defect).
- Screens: per-locale screen definition files (en_US, ja_JP, zh_CN) and ja/zh page folders. Resolution order: explicit `locale` request parameter, then session locale; fallback to the default locale at two points (locale, then screen).
- Catalog content comes from locale-specific detail rows in the catalog DAO SQL, keyed by locale.
- Customer profile stores a preferred language.
- Number/currency formatting is a utility taking locale, decimal places and optional pattern.
- Encoding: a filter mapped to all URLs sets the request character encoding (UTF-8) before sign-on; a separate helper converts URL-encoded Shift-JIS/JIS values to Unicode.
- Admin rich client text comes from resource bundles (default and German).
- Locale parsing for three-part locales was inferred from reading, not executed; parts of the parser are dead code.
