import { bigserial, index, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

// A shortened link: a unique slug pointing at a destination URL.
export const links = pgTable("links", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  targetUrl: text("target_url").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// One row per redirect. Raw IP addresses are intentionally not stored; only the
// derived country and coarse device attributes are kept.
export const clicks = pgTable(
  "clicks",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    slug: text("slug")
      .notNull()
      .references(() => links.slug, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    referrer: text("referrer"),
    referrerHost: text("referrer_host"),
    country: text("country"),
    deviceType: text("device_type"),
    browser: text("browser"),
    os: text("os"),
  },
  (t) => [
    index("clicks_slug_idx").on(t.slug),
    index("clicks_slug_created_at_idx").on(t.slug, t.createdAt),
  ],
);

export type Link = typeof links.$inferSelect;
export type Click = typeof clicks.$inferSelect;
export type NewClick = typeof clicks.$inferInsert;
