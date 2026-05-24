import { desc, eq, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { redis, SLUG_CACHE_TTL_SECONDS, slugCacheKey } from "@/lib/redis";
import { clicks, links } from "@/lib/schema";
import { generateSlug, isValidCustomSlug } from "@/lib/slug";
import { normalizeHttpUrl } from "@/lib/url";

export const runtime = "nodejs";

const createSchema = z.object({
  url: z.string().url().max(2048),
  customSlug: z.string().trim().optional(),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Request body must be valid JSON");
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const targetUrl = normalizeHttpUrl(parsed.data.url);
  if (!targetUrl) {
    return badRequest("Only http and https URLs are supported");
  }

  const customSlug = parsed.data.customSlug;
  let slug: string;

  if (customSlug) {
    if (!isValidCustomSlug(customSlug)) {
      return badRequest("Alias must be 3–32 characters: letters, numbers, - or _");
    }
    if (await slugExists(customSlug)) {
      return NextResponse.json({ error: "That alias is already taken" }, { status: 409 });
    }
    slug = customSlug;
  } else {
    slug = await generateUniqueSlug();
  }

  const [created] = await db.insert(links).values({ slug, targetUrl }).returning();

  // Warm the cache so the very first redirect is a hit.
  redis.set(slugCacheKey(slug), created.targetUrl, "EX", SLUG_CACHE_TTL_SECONDS).catch(() => {});

  return NextResponse.json(
    { slug: created.slug, targetUrl: created.targetUrl, createdAt: created.createdAt },
    { status: 201 },
  );
}

export async function GET() {
  const rows = await db
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

  return NextResponse.json({ links: rows });
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

async function slugExists(slug: string): Promise<boolean> {
  const existing = await db.query.links.findFirst({
    where: eq(links.slug, slug),
    columns: { id: true },
  });
  return Boolean(existing);
}

async function generateUniqueSlug(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = generateSlug();
    if (!(await slugExists(candidate))) return candidate;
  }
  throw new Error("Could not generate a unique slug");
}
