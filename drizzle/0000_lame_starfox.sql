CREATE TABLE IF NOT EXISTS "user_sessions" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"user_id" varchar(256) NOT NULL,
	"csrf_token" varchar(256) NOT NULL,
	"auth_provider" varchar(64) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"auth_provider" varchar(64) NOT NULL,
	"email" varchar(256) NOT NULL,
	"first_name" varchar(256) NOT NULL,
	"last_name" varchar(256) NOT NULL,
	"profile_pic_url" varchar(256) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
