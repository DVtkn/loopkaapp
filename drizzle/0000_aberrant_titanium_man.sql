CREATE TABLE "ai_insights" (
	"id" text PRIMARY KEY NOT NULL,
	"couple_id" text NOT NULL,
	"type" text NOT NULL,
	"content" jsonb NOT NULL,
	"period_start" text NOT NULL,
	"period_end" text NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"couple_id" text NOT NULL,
	"sender_login" text NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "couple_data" (
	"id" text PRIMARY KEY NOT NULL,
	"data" jsonb NOT NULL,
	"last_updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pair_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"from_login" text NOT NULL,
	"from_name" text NOT NULL,
	"from_avatar" text NOT NULL,
	"to_login" text NOT NULL,
	"status" text NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "photos" (
	"id" text PRIMARY KEY NOT NULL,
	"couple_id" text NOT NULL,
	"uploader_login" text NOT NULL,
	"image_bytes" "bytea" NOT NULL,
	"mime_type" text NOT NULL,
	"caption" text,
	"width" integer,
	"height" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "relationship_metrics" (
	"id" text PRIMARY KEY NOT NULL,
	"couple_id" text NOT NULL,
	"metric_date" text NOT NULL,
	"radar_scores" jsonb NOT NULL,
	"mood_average" real,
	"mood_entries_count" integer DEFAULT 0,
	"interaction_count" integer DEFAULT 0,
	"quiz_completed" boolean DEFAULT false,
	"streak_days" integer DEFAULT 0,
	"created_at" text NOT NULL,
	CONSTRAINT "relationship_metrics_couple_id_metric_date_unique" UNIQUE("couple_id","metric_date")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"login" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"gender" text,
	"avatar_emoji" text DEFAULT 'sparkles' NOT NULL,
	"partner_login" text,
	"paired_at" text,
	"start_date" text,
	"city" text,
	"love_language" text,
	"attachment_style" text,
	"current_mood" jsonb,
	"last_active_at" text,
	"created_at" text NOT NULL,
	CONSTRAINT "users_login_unique" UNIQUE("login")
);
--> statement-breakpoint
CREATE INDEX "ai_insights_couple_created_idx" ON "ai_insights" USING btree ("couple_id","created_at");--> statement-breakpoint
CREATE INDEX "chat_messages_couple_created_idx" ON "chat_messages" USING btree ("couple_id","created_at");--> statement-breakpoint
CREATE INDEX "chat_messages_sender_login_idx" ON "chat_messages" USING btree ("sender_login");--> statement-breakpoint
CREATE INDEX "pair_requests_from_to_idx" ON "pair_requests" USING btree ("from_login","to_login");--> statement-breakpoint
CREATE INDEX "pair_requests_to_login_idx" ON "pair_requests" USING btree ("to_login");--> statement-breakpoint
CREATE INDEX "pair_requests_status_idx" ON "pair_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "photos_couple_id_idx" ON "photos" USING btree ("couple_id");--> statement-breakpoint
CREATE INDEX "photos_created_at_idx" ON "photos" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "users_partner_login_idx" ON "users" USING btree ("partner_login");