CREATE TABLE `checkout_order` (
	`order_id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`email_address` text NOT NULL,
	`order_date` integer NOT NULL,
	`locale` text NOT NULL,
	`total_price` real NOT NULL,
	`ship_to` text NOT NULL,
	`bill_to` text NOT NULL,
	`card_number` text NOT NULL,
	`card_type` text NOT NULL,
	`expiry_date` text NOT NULL,
	`entered_card_id` integer,
	FOREIGN KEY (`entered_card_id`) REFERENCES `payment_card`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `checkout_order_line` (
	`order_id` text NOT NULL,
	`line_no` integer NOT NULL,
	`item_id` text NOT NULL,
	`quantity` integer NOT NULL,
	`unit_price` real NOT NULL,
	PRIMARY KEY(`order_id`, `line_no`),
	FOREIGN KEY (`order_id`) REFERENCES `checkout_order`(`order_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `payment_card` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`card_number` text NOT NULL,
	`card_type` text NOT NULL,
	`expiry_date` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sequence` (
	`name` text PRIMARY KEY NOT NULL,
	`counter` integer NOT NULL
);
