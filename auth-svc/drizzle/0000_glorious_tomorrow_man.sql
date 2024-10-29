CREATE TABLE IF NOT EXISTS "profiles" (
	"user_id" varchar(20) PRIMARY KEY NOT NULL,
	"email" varchar(255),
	"full_name" varchar(100),
	"bio" text,
	"favorite_color" varchar(7),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" varchar(20) PRIMARY KEY NOT NULL,
	"username" varchar(20) NOT NULL,
	"hashed_pass" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
