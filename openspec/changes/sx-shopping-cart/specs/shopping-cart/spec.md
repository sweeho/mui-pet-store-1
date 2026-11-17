## ADDED Requirements

### Requirement: Cart per shopper session
Recovered from: CART-REQ-0001

The system SHALL keep one cart per shopper session as a map of item id to quantity, holding at most one line per item id.

#### Scenario: Same item added twice
- **GIVEN** a shopper session with item A in the cart
- **WHEN** item A is added again
- **THEN** the cart still holds exactly one line for item A

### Requirement: Cart holds one quantity per item
Recovered from: shopping-cart-REQ-0001

The system SHALL hold, per shopper session, a cart mapping each item identifier to a single quantity, so that adding an item already in the cart replaces its quantity rather than accumulating.

#### Scenario: Re-adding replaces quantity
- **GIVEN** item A in the cart with quantity 2
- **WHEN** item A is added with quantity 5
- **THEN** the quantity of item A is 5

#### Scenario: Add without quantity
- **GIVEN** an empty cart
- **WHEN** item A is added without a quantity
- **THEN** item A is in the cart with quantity 1

### Requirement: Quantity update
Recovered from: shopping-cart-BR-0001

GIVEN an item in the cart WHEN its quantity is updated to zero or less THEN the system SHALL remove the item from the cart; WHEN updated to a positive value THEN the system SHALL set that quantity.

#### Scenario: Update to zero
- **GIVEN** item A in the cart with quantity 3
- **WHEN** its quantity is updated to 0
- **THEN** item A is removed from the cart

#### Scenario: Update to positive
- **GIVEN** item A in the cart with quantity 3
- **WHEN** its quantity is updated to 7
- **THEN** item A has quantity 7

### Requirement: Invalid quantity treated as zero
Recovered from: CART-REQ-0002

GIVEN a quantity update request WHEN a submitted quantity is not a valid whole number THEN the system SHALL treat the quantity as 0.

#### Scenario: Non-numeric quantity
- **GIVEN** item A in the cart
- **WHEN** a quantity of "abc" is submitted for item A
- **THEN** the quantity is treated as 0 and item A is removed

### Requirement: Remove, empty and count
Recovered from: shopping-cart-REQ-0002

The system SHALL allow removing a single item from the cart, emptying the cart entirely, and reporting the number of distinct items in the cart.

#### Scenario: Remove one item
- **GIVEN** a cart with items A and B
- **WHEN** item A is removed
- **THEN** only item B remains

#### Scenario: Empty the cart
- **GIVEN** a cart with items A and B
- **WHEN** the cart is emptied
- **THEN** the cart holds no items and its count is 0

### Requirement: Item count is distinct lines
Recovered from: CART-REQ-0005

The system SHALL report the cart item count as the number of distinct item lines, not the sum of quantities.

#### Scenario: Count with multiple quantities
- **GIVEN** a cart with item A quantity 3 and item B quantity 2
- **WHEN** the item count is requested
- **THEN** the count is 2

### Requirement: Cart line presentation
Recovered from: shopping-cart-REQ-0003

The system SHALL present each cart line with item, product, category, product name, attribute, quantity and unit cost, where the name, attribute and unit cost come from the catalog in the shopper's locale (default US English), and the unit cost is the catalog list cost.

#### Scenario: Line shown with catalog data
- **GIVEN** item A in the cart with quantity 2 and a catalog entry in the shopper's locale
- **WHEN** the cart is listed
- **THEN** the line shows item, product, category, name, attribute, quantity 2 and the catalog list cost as unit cost

#### Scenario: No locale given
- **GIVEN** a shopper with no locale
- **WHEN** the cart is listed
- **THEN** catalog text is taken in US English

### Requirement: Line total and subtotal
Recovered from: shopping-cart-BR-0002

The system SHALL compute a line total as quantity times unit cost and the cart subtotal as the sum of line totals, without rounding.

#### Scenario: Subtotal computed
- **GIVEN** item A quantity 2 at cost 10.50 and item B quantity 1 at cost 3.25
- **WHEN** the cart is listed
- **THEN** line totals are 21.00 and 3.25 and the subtotal is 24.25

### Requirement: Unavailable catalog item omitted
Recovered from: shopping-cart-BR-0003

GIVEN a cart item whose catalog lookup fails WHEN the cart is listed THEN the system SHALL omit that item from the list and subtotal and continue.

#### Scenario: Lookup failure
- **GIVEN** a cart with items A and B where the catalog lookup for B fails
- **WHEN** the cart is listed
- **THEN** only item A appears and the subtotal covers item A alone, with no error raised

### Requirement: Add to cart and proceed to checkout
Recovered from: shopping-cart-REQ-0004

The system SHALL let a shopper add an item to the cart from the catalog and proceed to check out.

#### Scenario: Add then check out
- **GIVEN** a shopper viewing a catalog item
- **WHEN** the shopper adds it to the cart and chooses to check out
- **THEN** the item is in the cart and the shopper proceeds to checkout
