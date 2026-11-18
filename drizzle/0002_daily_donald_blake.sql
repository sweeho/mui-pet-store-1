CREATE TABLE `account` (
	`account_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`status` text NOT NULL,
	`contact_id` integer NOT NULL,
	`card_id` integer NOT NULL,
	FOREIGN KEY (`contact_id`) REFERENCES `contact`(`contact_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`card_id`) REFERENCES `credit_card`(`card_id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "account_status" CHECK("account"."status" IN ('active', 'disabled'))
);
--> statement-breakpoint
CREATE TABLE `address` (
	`address_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`street1` text NOT NULL,
	`street2` text,
	`city` text NOT NULL,
	`state` text NOT NULL,
	`zip` text NOT NULL,
	`country` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `contact` (
	`contact_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`family_name` text NOT NULL,
	`given_name` text NOT NULL,
	`telephone` text NOT NULL,
	`email` text NOT NULL,
	`address_id` integer NOT NULL,
	FOREIGN KEY (`address_id`) REFERENCES `address`(`address_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `credit_card` (
	`card_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`card_number` text NOT NULL,
	`card_type` text NOT NULL,
	`expiry_date` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `customer` (
	`user_id` text PRIMARY KEY NOT NULL,
	`account_id` integer NOT NULL,
	`profile_id` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `sign_on`(`username`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`account_id`) REFERENCES `account`(`account_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`profile_id`) REFERENCES `profile`(`profile_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `profile` (
	`profile_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`language` text NOT NULL,
	`favorite_category` text,
	`my_list` integer NOT NULL,
	`banner` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sign_on` (
	`username` text PRIMARY KEY NOT NULL,
	`password` text NOT NULL,
	CONSTRAINT "sign_on_username_length" CHECK(length("sign_on"."username") BETWEEN 1 AND 50),
	CONSTRAINT "sign_on_password_length" CHECK(length("sign_on"."password") BETWEEN 1 AND 50)
);
--> statement-breakpoint
CREATE TABLE `web_session` (
	`session_id` text PRIMARY KEY NOT NULL,
	`username` text,
	`signed_on` integer NOT NULL,
	`language` text NOT NULL,
	`cart_language` text NOT NULL,
	`last_access` integer NOT NULL
);
