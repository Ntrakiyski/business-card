CREATE TABLE "custom_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"image_url" text,
	"order" integer DEFAULT 0,
	"enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"username" text NOT NULL,
	"card_name" text DEFAULT 'My Card' NOT NULL,
	"is_primary" boolean DEFAULT false,
	"is_public" boolean DEFAULT true,
	"display_name" text,
	"job_title" text,
	"company" text,
	"location" text,
	"bio" text,
	"profile_image_url" text,
	"email" text,
	"phone" text,
	"website" text,
	"address" text,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "profiles_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"bullets" jsonb,
	"icon" text,
	"order" integer DEFAULT 0,
	"enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "social_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"platform" text NOT NULL,
	"url" text NOT NULL,
	"enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "widget_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"widget_type" text NOT NULL,
	"enabled" boolean DEFAULT true,
	"order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "custom_links" ADD CONSTRAINT "custom_links_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_links" ADD CONSTRAINT "social_links_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "widget_settings" ADD CONSTRAINT "widget_settings_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_custom_links_profile_id" ON "custom_links" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_custom_links_order" ON "custom_links" USING btree ("order");--> statement-breakpoint
CREATE INDEX "idx_profiles_user_id" ON "profiles" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_profiles_username" ON "profiles" USING btree ("username");--> statement-breakpoint
CREATE INDEX "idx_profiles_is_public" ON "profiles" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "idx_profiles_is_primary" ON "profiles" USING btree ("is_primary");--> statement-breakpoint
CREATE INDEX "idx_services_profile_id" ON "services" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_services_order" ON "services" USING btree ("order");--> statement-breakpoint
CREATE INDEX "idx_social_links_profile_id" ON "social_links" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_widget_settings_profile_id" ON "widget_settings" USING btree ("profile_id");--> statement-breakpoint
CREATE UNIQUE INDEX "widget_settings_profile_id_widget_type_key" ON "widget_settings" USING btree ("profile_id","widget_type");