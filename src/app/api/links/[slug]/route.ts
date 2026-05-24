import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { redis, slugCacheKey } from "@/lib/redis";
import { links } from "@/lib/schema";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  // Recorded clicks are removed automatically by the foreign-key cascade.
  const deleted = await db
    .delete(links)
    .where(eq(links.slug, slug))
    .returning({ slug: links.slug });

  if (deleted.length === 0) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  // Drop the cached redirect so the slug stops resolving immediately.
  redis.del(slugCacheKey(slug)).catch(() => {});

  return new NextResponse(null, { status: 204 });
}
