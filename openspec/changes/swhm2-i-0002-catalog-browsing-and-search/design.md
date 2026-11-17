## Context

Legacy implementation notes only. The catalog is read through an EJB 2 stateless session bean (CatalogEJB) delegating to a DAO (GenericCatalogDAO, CloudscapeCatalogDAO). SQL statements live in the deployment file `CatalogDAOSQL.xml`; the database variant is selected by configured identifier.

## User interface

No screen records were extracted for this capability; its user interface is unspecified. Pass evidence mentions storefront JSP pages for categories, products, items and search, and a populate servlet, but only as file names (low confidence, record CAT-REQ-0001). A separate pass states lists show two rows at a time with next/previous links and a list price plus a lower member price on the item page; that text conflicts with the consolidated wording and needs a person to decide.

## Legacy implementation notes

- Paging: scrollable ResultSet `absolute(start+1)`, reading `count` rows, flagging whether a next page exists. A page size of zero or less still returns one entry because the first row is read before the count check (CB-BR-0003, not carried as a requirement; suspected defect).
- Ordering: categories and products ordered by name in SQL; GET_ITEMS has no `order by`, so item order is database-defined.
- Locale: queries filter on the locale string `Locale.toString()`; a missing localized row yields null, with no fallback. The text `default` means the server default locale.
- Search: GenericCatalogDAO does not lower-case keywords while the SQL lower-cases columns (suspected defect); CloudscapeCatalogDAO lower-cases keywords. Keywords are de-duplicated; each yields three LIKE parameters OR-ed. Tokenising in the DAO uses whitespace; the internationalisation component offers locale-aware word-boundary splitting (INTL-REQ-0006).
- Schema: list price need not be at or above unit cost (no CHECK).
- Errors: data-access failures surface as a system error with the underlying message.
