CREATE TABLE "care_notes" (
	"id" text PRIMARY KEY NOT NULL,
	"couple_id" text NOT NULL,
	"author_login" text NOT NULL,
	"target_login" text NOT NULL,
	"content" text NOT NULL,
	"category" text DEFAULT 'general' NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "couple_events" (
	"id" text PRIMARY KEY NOT NULL,
	"couple_id" text NOT NULL,
	"target_login" text NOT NULL,
	"sender_login" text NOT NULL,
	"event_type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "couple_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"couple_id" text NOT NULL,
	"radar_metrics" jsonb,
	"radar_trust" numeric(5, 2) DEFAULT '50.00' NOT NULL,
	"radar_closeness" numeric(5, 2) DEFAULT '50.00' NOT NULL,
	"radar_communication" numeric(5, 2) DEFAULT '50.00' NOT NULL,
	"radar_intimacy" numeric(5, 2) DEFAULT '50.00' NOT NULL,
	"radar_values" numeric(5, 2) DEFAULT '50.00' NOT NULL,
	"archetype_title" text NOT NULL,
	"archetype_description" text NOT NULL,
	"lead_spheres" jsonb NOT NULL,
	"synergy_points" jsonb,
	"growth_zones" jsonb,
	"blind_spots" jsonb,
	"calculated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "couple_reports_couple_id_unique" UNIQUE("couple_id")
);
--> statement-breakpoint
CREATE TABLE "couples" (
	"id" text PRIMARY KEY NOT NULL,
	"user1_id" text,
	"user2_id" text,
	"status" text DEFAULT 'active' NOT NULL,
	"xp_points" integer DEFAULT 0 NOT NULL,
	"current_level" integer DEFAULT 1 NOT NULL,
	"streak_days" integer DEFAULT 0 NOT NULL,
	"start_date" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "date_events" (
	"id" text PRIMARY KEY NOT NULL,
	"couple_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"location" text,
	"event_date" text NOT NULL,
	"status" text DEFAULT 'planned' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_login" text NOT NULL,
	"couple_id" text,
	"subscription" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_answers" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"user_id" text NOT NULL,
	"question_id" text NOT NULL,
	"scale_id" text,
	"selected_value" numeric(8, 2) NOT NULL,
	"weight" numeric(5, 2) DEFAULT '1.00' NOT NULL,
	"reaction_time_ms" integer,
	"toggle_count" integer DEFAULT 0 NOT NULL,
	"target_type" varchar(24) DEFAULT 'self' NOT NULL,
	"raw_payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uniq_user_session_question" UNIQUE("session_id","user_id","question_id")
);
--> statement-breakpoint
CREATE TABLE "test_drafts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"test_id" varchar(64) NOT NULL,
	"current_question_index" integer DEFAULT 0 NOT NULL,
	"answers" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"test_id" text NOT NULL,
	"couple_id" text NOT NULL,
	"test_class" text DEFAULT 'couple' NOT NULL,
	"status" text DEFAULT 'in_progress' NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "time_capsules" (
	"id" text PRIMARY KEY NOT NULL,
	"couple_id" text NOT NULL,
	"author_login" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"open_at" text NOT NULL,
	"is_opened" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_psych_profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"couple_id" text NOT NULL,
	"session_id" text NOT NULL,
	"trait_scores" jsonb,
	"dominant_vectors" jsonb,
	"e_safety" numeric(5, 2) DEFAULT '50.00' NOT NULL,
	"a_autonomy" numeric(5, 2) DEFAULT '50.00' NOT NULL,
	"c_closeness" numeric(5, 2) DEFAULT '50.00' NOT NULL,
	"r_repair" numeric(5, 2) DEFAULT '50.00' NOT NULL,
	"v_future" numeric(5, 2) DEFAULT '50.00' NOT NULL,
	"consistency_score" numeric(5, 2),
	"raw_responses" jsonb,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "couples" ADD CONSTRAINT "couples_user1_id_users_id_fk" FOREIGN KEY ("user1_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "couples" ADD CONSTRAINT "couples_user2_id_users_id_fk" FOREIGN KEY ("user2_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_answers" ADD CONSTRAINT "test_answers_session_id_test_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."test_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_answers" ADD CONSTRAINT "test_answers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_drafts" ADD CONSTRAINT "test_drafts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_psych_profiles" ADD CONSTRAINT "user_psych_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "care_notes_couple_id_idx" ON "care_notes" USING btree ("couple_id");--> statement-breakpoint
CREATE INDEX "couple_events_target_idx" ON "couple_events" USING btree ("target_login","created_at");--> statement-breakpoint
CREATE INDEX "couple_events_couple_idx" ON "couple_events" USING btree ("couple_id","created_at");--> statement-breakpoint
CREATE INDEX "date_events_couple_id_idx" ON "date_events" USING btree ("couple_id");--> statement-breakpoint
CREATE INDEX "push_subscriptions_user_idx" ON "push_subscriptions" USING btree ("user_login");--> statement-breakpoint
CREATE INDEX "test_answers_session_idx" ON "test_answers" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "test_answers_user_idx" ON "test_answers" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_test_draft_idx" ON "test_drafts" USING btree ("user_id","test_id");--> statement-breakpoint
CREATE INDEX "test_sessions_couple_id_idx" ON "test_sessions" USING btree ("couple_id");--> statement-breakpoint
CREATE INDEX "test_sessions_test_id_idx" ON "test_sessions" USING btree ("test_id");--> statement-breakpoint
CREATE INDEX "test_sessions_status_idx" ON "test_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "time_capsules_couple_id_idx" ON "time_capsules" USING btree ("couple_id");