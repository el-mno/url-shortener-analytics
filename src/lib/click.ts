import { db } from "./db";
import { countryFromHeaders } from "./geo";
import { clicks } from "./schema";
import { parseUserAgent } from "./ua";

// Derive the analytics attributes for a single redirect from the request
// headers. No raw IP address is retained — only the resolved country.
export async function extractClickContext(headers: Headers) {
  const referrer = headers.get("referer");
  const userAgent = headers.get("user-agent");
  const { deviceType, browser, os } = parseUserAgent(userAgent);

  return {
    referrer,
    referrerHost: referrerHostFrom(referrer),
    country: await countryFromHeaders(headers),
    deviceType,
    browser,
    os,
  };
}

export async function recordClick(slug: string, headers: Headers): Promise<void> {
  const context = await extractClickContext(headers);
  await db.insert(clicks).values({ slug, ...context });
}

function referrerHostFrom(referrer: string | null): string | null {
  if (!referrer) return null;
  try {
    return new URL(referrer).hostname || null;
  } catch {
    return null;
  }
}
