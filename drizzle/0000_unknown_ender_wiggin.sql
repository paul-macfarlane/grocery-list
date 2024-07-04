CREATE TABLE `grocery_list_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`grocery_list_id` integer NOT NULL,
	`name` text(256) NOT NULL,
	`quantity` integer,
	`notes` text,
	`link` text,
	`created_by_user_id` text(256) NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`grocery_list_id`) REFERENCES `grocery_lists`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `grocery_lists` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text(256) NOT NULL,
	`created_by_user_id` text(256) NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_sessions` (
	`id` text(256) PRIMARY KEY NOT NULL,
	`user_id` text(256) NOT NULL,
	`csrf_token` text(256) NOT NULL,
	`auth_provider` text(64) NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text(256) PRIMARY KEY NOT NULL,
	`auth_provider` text(64) NOT NULL,
	`email` text(256) NOT NULL,
	`first_name` text(256) NOT NULL,
	`last_name` text(256) NOT NULL,
	`profile_pic_url` text(256) NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
