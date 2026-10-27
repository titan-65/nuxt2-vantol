-- void:allow-destructive
CREATE TABLE `flavors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`price_cents` integer NOT NULL,
	`color` text NOT NULL,
	`accent` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `flavors_slug_unique` ON `flavors` (`slug`);--> statement-breakpoint
CREATE TABLE `week_flavors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`week_id` integer NOT NULL,
	`flavor_id` integer NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`week_id`) REFERENCES `weeks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`flavor_id`) REFERENCES `flavors`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `weeks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`label` text NOT NULL,
	`starts_on` text NOT NULL,
	`ends_on` text NOT NULL,
	`is_active` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
DROP TABLE `messages`;