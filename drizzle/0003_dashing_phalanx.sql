CREATE TABLE `shopping_cart` (
	`cart_id` text PRIMARY KEY NOT NULL,
	`contents` text NOT NULL,
	`last_access` integer NOT NULL
);
