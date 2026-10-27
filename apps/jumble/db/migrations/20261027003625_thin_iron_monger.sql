CREATE TABLE `order_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`flavor_slug` text NOT NULL,
	`flavor_name` text NOT NULL,
	`box_size` integer NOT NULL,
	`box_label` text NOT NULL,
	`quantity` integer NOT NULL,
	`price_cents` integer NOT NULL,
	`line_total_cents` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`public_id` text NOT NULL,
	`customer_name` text NOT NULL,
	`customer_email` text NOT NULL,
	`customer_phone` text NOT NULL,
	`location_id` integer NOT NULL,
	`pickup_date` text NOT NULL,
	`pickup_window` text NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`subtotal_cents` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`location_id`) REFERENCES `pickup_locations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_public_id_unique` ON `orders` (`public_id`);--> statement-breakpoint
CREATE TABLE `pickup_locations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`address` text NOT NULL,
	`hours` text NOT NULL,
	`is_active` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pickup_locations_slug_unique` ON `pickup_locations` (`slug`);
--> statement-breakpoint
INSERT INTO pickup_locations (slug, name, address, hours, is_active) VALUES
  ('constant-spring', 'Jumble Kitchen', '12 Constant Spring Road, Kingston', 'Tue–Sat · 10:00–17:00', 1);
