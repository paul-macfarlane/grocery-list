CREATE TABLE `user_sessions` (
	`id` text(256) PRIMARY KEY NOT NULL,
	`user_id` text(256) NOT NULL,
	`csrf_token` text(256) NOT NULL,
	`auth_provider` text(64) NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`expires_at` integer NOT NULL
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
