CREATE TABLE `reports` (
	`id` integer PRIMARY KEY NOT NULL,
	`service_id` text NOT NULL,
	`service_name` text NOT NULL,
	`comment` text,
	`reported_at` text NOT NULL,
	`user_ip` text
);
