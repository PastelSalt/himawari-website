CREATE TABLE "analytics_salts" (
	"day" date PRIMARY KEY NOT NULL,
	"salt" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_page_views" (
	"day" date NOT NULL,
	"path" text NOT NULL,
	"views" integer NOT NULL,
	"visitors" integer NOT NULL,
	CONSTRAINT "daily_page_views_day_path_pk" PRIMARY KEY("day","path")
);
--> statement-breakpoint
CREATE TABLE "page_views" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "page_views_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"path" text NOT NULL,
	"lang" text NOT NULL,
	"referrer_host" text,
	"device_type" text NOT NULL,
	"browser" text NOT NULL,
	"country" text,
	"visitor_hash" text NOT NULL,
	"environment" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"bucket" text NOT NULL,
	"key_hash" text NOT NULL,
	"window_start" timestamp with time zone NOT NULL,
	"hits" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "rate_limits_bucket_key_hash_window_start_pk" PRIMARY KEY("bucket","key_hash","window_start")
);
--> statement-breakpoint
CREATE INDEX "page_views_occurred_at" ON "page_views" USING btree ("occurred_at");