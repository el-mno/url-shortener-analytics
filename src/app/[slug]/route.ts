import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse, after } from "next/server";
import { recordClick } from "@/lib/click";
import { db } from "@/lib/db";
import { redis, SLUG_CACHE_TTL_SECONDS, slugCacheKey } from "@/lib/redis";
import { links } from "@/lib/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const target = await resolveTarget(slug);
  if (!target) {
    const home = new URL("/", request.url);
    home.searchParams.set("notfound", slug);
    return NextResponse.redirect(home, 302);
  }

  // Persist the click after the redirect is sent so it never adds latency.
  after(async () => {
    try {
      await recordClick(slug, request.headers);
    } catch (err) {
      console.error("Failed to record click", err);
    }
  });

  return NextResponse.redirect(target, 302);
}

// Cache-aside: serve from Redis when warm, otherwise read Postgres and
// backfill the cache. Redis errors degrade gracefully to a direct DB read.
async function resolveTarget(slug: string): Promise<string | null> {
  const key = slugCacheKey(slug);

  try {
    const cached = await redis.get(key);
    if (cached) return cached;
  } catch (err) {
    console.error("Redis read failed; falling back to Postgres", err);
  }

  const row = await db.query.links.findFirst({
    where: eq(links.slug, slug),
    columns: { targetUrl: true },
  });
  if (!row) return null;

  redis.set(key, row.targetUrl, "EX", SLUG_CACHE_TTL_SECONDS).catch(() => {});
  return row.targetUrl;
}
