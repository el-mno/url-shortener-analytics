import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { db } from "./db";
import { clicks, type Link, links } from "./schema";

export async function getLink(slug: string): Promise<Link | undefined> {
  return db.query.links.findFirst({ where: eq(links.slug, slug) });
}

export interface LinkSummary {
  slug: string;
  targetUrl: string;
  createdAt: Date;
  clickCount: number;
}

// All links, newest first, with a total click count joined in.
export async function getLinksWithCounts(): Promise<LinkSummary[]> {
  return db
    .select({
      slug: links.slug,
      targetUrl: links.targetUrl,
      createdAt: links.createdAt,
      clickCount: sql<number>`count(${clicks.id})`.mapWith(Number),
    })
    .from(links)
    .leftJoin(clicks, eq(clicks.slug, links.slug))
    .groupBy(links.id)
    .orderBy(desc(links.createdAt));
}

export interface DayBucket {
  date: string;
  clicks: number;
}

// A continuous daily time series for the last `days` days, with zero-filled gaps
// so the chart has no holes.
export async function getClicksByDay(slug: string, days = 30): Promise<DayBucket[]> {
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - (days - 1));

  const dayExpr = sql<string>`to_char(date_trunc('day', ${clicks.createdAt} AT TIME ZONE 'UTC'), 'YYYY-MM-DD')`;
  const rows = await db
    .select({ date: dayExpr, clicks: count() })
    .from(clicks)
    .where(and(eq(clicks.slug, slug), gte(clicks.createdAt, since)))
    .groupBy(dayExpr);

  const counts = new Map(rows.map((row) => [row.date, Number(row.clicks)]));
  const series: DayBucket[] = [];
  for (let i = 0; i < days; i++) {
    const day = new Date(since);
    day.setUTCDate(since.getUTCDate() + i);
    const key = day.toISOString().slice(0, 10);
    series.push({ date: key, clicks: counts.get(key) ?? 0 });
  }
  return series;
}

export interface BreakdownItem {
  label: string;
  count: number;
}

async function breakdown(
  slug: string,
  column: AnyPgColumn,
  fallback: string,
): Promise<BreakdownItem[]> {
  const rows = await db
    .select({ value: column, count: count() })
    .from(clicks)
    .where(eq(clicks.slug, slug))
    .groupBy(column)
    .orderBy(desc(count()));

  return rows.map((row) => ({
    label: (row.value as string | null) ?? fallback,
    count: Number(row.count),
  }));
}

export const getCountryBreakdown = (slug: string) => breakdown(slug, clicks.country, "Unknown");
export const getReferrerBreakdown = (slug: string) => breakdown(slug, clicks.referrerHost, "Direct");
export const getDeviceBreakdown = (slug: string) => breakdown(slug, clicks.deviceType, "unknown");
export const getBrowserBreakdown = (slug: string) => breakdown(slug, clicks.browser, "Unknown");

export interface LinkStats {
  link: Link;
  totalClicks: number;
  byDay: DayBucket[];
  countries: BreakdownItem[];
  referrers: BreakdownItem[];
  devices: BreakdownItem[];
  browsers: BreakdownItem[];
}

export async function getLinkStats(slug: string): Promise<LinkStats | null> {
  const link = await getLink(slug);
  if (!link) return null;

  const [byDay, countries, referrers, devices, browsers] = await Promise.all([
    getClicksByDay(slug),
    getCountryBreakdown(slug),
    getReferrerBreakdown(slug),
    getDeviceBreakdown(slug),
    getBrowserBreakdown(slug),
  ]);

  const totalClicks = countries.reduce((sum, item) => sum + item.count, 0);

  return { link, totalClicks, byDay, countries, referrers, devices, browsers };
}
