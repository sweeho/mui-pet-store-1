CREATE TABLE `contact_info` (
	`contact_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` text,
	`name` text,
	`address` text,
	`email` text,
	`phone` text
);
--> statement-breakpoint
CREATE TABLE `counter` (
	`name` text PRIMARY KEY NOT NULL,
	`value` integer NOT NULL,
	CONSTRAINT "counter_value_integer" CHECK(typeof("counter"."value") = 'integer')
);
--> statement-breakpoint
CREATE TABLE `inventory` (
	`item_id` text PRIMARY KEY NOT NULL,
	`quantity` integer NOT NULL,
	CONSTRAINT "inventory_quantity_floor" CHECK("inventory"."quantity" >= 0)
);
--> statement-breakpoint
CREATE TABLE `order_status` (
	`order_id` text PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	CONSTRAINT "order_status_length" CHECK(length("order_status"."status") <= 20)
);
--> statement-breakpoint
CREATE TABLE `supplier_order` (
	`order_id` text PRIMARY KEY NOT NULL,
	`order_date` integer NOT NULL,
	`status` text NOT NULL,
	`contact_id` integer NOT NULL,
	FOREIGN KEY (`contact_id`) REFERENCES `contact_info`(`contact_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `supplier_order_line` (
	`order_id` text NOT NULL,
	`line_num` integer NOT NULL,
	`category_id` text,
	`product_id` text,
	`item_id` text NOT NULL,
	`quantity` integer NOT NULL,
	`unit_price` real,
	`quantity_shipped` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`order_id`, `line_num`),
	CONSTRAINT "supplier_order_line_quantity_positive" CHECK("supplier_order_line"."quantity" > 0),
	CONSTRAINT "supplier_order_line_shipped_within_quantity" CHECK("supplier_order_line"."quantity_shipped" <= "supplier_order_line"."quantity")
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_order_line` (
	`order_id` numeric NOT NULL,
	`line_num` integer NOT NULL,
	`category_id` text,
	`product_id` text,
	`item_id` text NOT NULL,
	`quantity` integer NOT NULL,
	`unit_price` real,
	`quantity_shipped` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`order_id`, `line_num`),
	CONSTRAINT "order_line_quantity_positive" CHECK("__new_order_line"."quantity" > 0),
	CONSTRAINT "order_line_shipped_within_quantity" CHECK("__new_order_line"."quantity_shipped" <= "__new_order_line"."quantity")
);
--> statement-breakpoint
INSERT INTO `__new_order_line`("order_id", "line_num", "category_id", "product_id", "item_id", "quantity", "unit_price") SELECT "order_id", "line_num", "category_id", "product_id", "item_id", "quantity", "unit_price" FROM `order_line`;--> statement-breakpoint
DROP TABLE `order_line`;--> statement-breakpoint
ALTER TABLE `__new_order_line` RENAME TO `order_line`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `order_manager_status_idx` ON `order_manager` (`status`);--> statement-breakpoint
CREATE INDEX `purchase_order_user_name_idx` ON `purchase_order` (`user_name`);--> statement-breakpoint
CREATE INDEX `purchase_order_order_time_idx` ON `purchase_order` (`order_time`);
--> statement-breakpoint
CREATE VIEW `v_order_status` AS
SELECT p.order_id AS order_id, p.user_name AS user_name, p.order_time AS order_time,
       p.total_price AS total_price, m.status AS status
FROM purchase_order p
JOIN order_manager m ON m.rowid = (SELECT MAX(rowid) FROM order_manager WHERE order_id = p.order_id);
