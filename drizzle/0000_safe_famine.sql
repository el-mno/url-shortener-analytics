CREATE TABLE "clicks" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"referrer" text,
	"referrer_host" text,
	"country" text,
	"device_type" text,
	"browser" text,
	"os" text
);
--> statement-breakpoint
CREATE TABLE "links" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"target_url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "links_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "clicks" ADD CONSTRAINT "clicks_slug_links_slug_fk" FOREIGN KEY ("slug") REFERENCES "public"."links"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "clicks_slug_idx" ON "clicks" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "clicks_slug_created_at_idx" ON "clicks" USING btree ("slug","created_at");