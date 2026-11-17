CREATE TABLE `category` (
	`catid` text(10) PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE `category_details` (
	`catid` text(10) NOT NULL,
	`locale` text NOT NULL,
	`name` text NOT NULL,
	PRIMARY KEY(`catid`, `locale`),
	FOREIGN KEY (`catid`) REFERENCES `category`(`catid`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `item` (
	`itemid` text(10) PRIMARY KEY NOT NULL,
	`productid` text(10) NOT NULL,
	FOREIGN KEY (`productid`) REFERENCES `product`(`productid`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `item_productid_idx` ON `item` (`productid`);--> statement-breakpoint
CREATE TABLE `item_details` (
	`itemid` text(10) NOT NULL,
	`locale` text NOT NULL,
	`list_price` real NOT NULL,
	`unit_cost` real NOT NULL,
	`image` text NOT NULL,
	`descn` text NOT NULL,
	`attr1` text,
	`attr2` text,
	`attr3` text,
	`attr4` text,
	`attr5` text,
	PRIMARY KEY(`itemid`, `locale`),
	FOREIGN KEY (`itemid`) REFERENCES `item`(`itemid`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `product` (
	`productid` text(10) PRIMARY KEY NOT NULL,
	`catid` text(10) NOT NULL,
	FOREIGN KEY (`catid`) REFERENCES `category`(`catid`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `product_catid_idx` ON `product` (`catid`);--> statement-breakpoint
CREATE TABLE `product_details` (
	`productid` text(10) NOT NULL,
	`locale` text NOT NULL,
	`name` text NOT NULL,
	`image` text,
	`descn` text,
	PRIMARY KEY(`productid`, `locale`),
	FOREIGN KEY (`productid`) REFERENCES `product`(`productid`) ON UPDATE no action ON DELETE no action
);
