import { inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { clicks, links, type NewClick } from "../src/lib/schema";

try {
  process.loadEnvFile(".env");
} catch {
  // .env is optional when the environment is already populated.
}

const DEMO_LINKS = [
  { slug: "launch", targetUrl: "https://example.com/product-launch-announcement" },
  { slug: "docs", targetUrl: "https://example.com/developer-documentation/getting-started" },
  { slug: "sale", targetUrl: "https://example.com/seasonal-deals-2026" },
];

const COUNTRIES = ["US", "GB", "DE", "FR", "IN", "BR", "JP", "CA", "AU", "NL"];
const REFERRERS = [
  null,
  null,
  "twitter.com",
  "news.ycombinator.com",
  "google.com",
  "linkedin.com",
  "github.com",
  "reddit.com",
];
const DEVICES = ["desktop", "desktop", "mobile", "mobile", "tablet"];
const BROWSERS = ["Chrome", "Chrome", "Safari", "Firefox", "Edge"];
const OSES = ["macOS", "Windows", "iOS", "Android", "Linux"];

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

// Random timestamp within the last `days` days, biased toward recent days so the
// time-series chart trends upward.
function randomRecentDate(days: number): Date {
  const skew = Math.random() ** 1.6; // weight toward 0 -> recent
  const msAgo = skew * days * 24 * 60 * 60 * 1000;
  return new Date(Date.now() - msAgo);
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  const slugs = DEMO_LINKS.map((link) => link.slug);
  // Remove any prior demo data so the script is idempotent (clicks cascade).
  await db.delete(links).where(inArray(links.slug, slugs));

  await db.insert(links).values(DEMO_LINKS);

  let totalClicks = 0;
  for (const link of DEMO_LINKS) {
    const clickCount = 120 + Math.floor(Math.random() * 280);
    const rows: NewClick[] = Array.from({ length: clickCount }, () => {
      const referrerHost = pick(REFERRERS);
      return {
        slug: link.slug,
        createdAt: randomRecentDate(30),
        referrer: referrerHost ? `https://${referrerHost}/` : null,
        referrerHost,
        country: pick(COUNTRIES),
        deviceType: pick(DEVICES),
        browser: pick(BROWSERS),
        os: pick(OSES),
      };
    });

    await db.insert(clicks).values(rows);
    totalClicks += clickCount;
    console.log(`  ${link.slug}: ${clickCount} clicks`);
  }

  await pool.end();
  console.log(`Seeded ${DEMO_LINKS.length} links and ${totalClicks} clicks.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
