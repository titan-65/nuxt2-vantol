-- void:allow-destructive
CREATE TABLE `order_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`type` text NOT NULL,
	`message` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade
);

--> statement-breakpoint
INSERT OR REPLACE INTO weeks (id, label, starts_on, ends_on, is_active) VALUES
  (2, 'Week of November 2', '2026-11-02', '2026-11-08', 0);--> statement-breakpoint
INSERT OR REPLACE INTO week_flavors (id, week_id, flavor_id, sort_order) VALUES
  (9, 2, 1, 1),
  (10, 2, 3, 2),
  (11, 2, 5, 3),
  (12, 2, 8, 4);
