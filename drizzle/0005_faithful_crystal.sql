CREATE TABLE `admin_session` (
	`session_id` text PRIMARY KEY NOT NULL,
	`user_name` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `message_outbox` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`queue` text NOT NULL,
	`origin` text NOT NULL,
	`order_id` numeric NOT NULL,
	`body` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `order_line` (
	`order_id` numeric NOT NULL,
	`line_num` integer NOT NULL,
	`category_id` text,
	`product_id` text,
	`item_id` text NOT NULL,
	`quantity` integer NOT NULL,
	`unit_price` real,
	PRIMARY KEY(`order_id`, `line_num`)
);
--> statement-breakpoint
CREATE TABLE `order_manager` (
	`order_id` numeric NOT NULL,
	`status` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `purchase_order` (
	`order_id` numeric PRIMARY KEY NOT NULL,
	`user_name` text NOT NULL,
	`order_time` integer NOT NULL,
	`locale` text NOT NULL,
	`total_price` real NOT NULL,
	`status` text NOT NULL
);
