// Pull the originating client IP out of common proxy headers. The first entry
// in x-forwarded-for is the closest to the real client.
export function clientIpFromHeaders(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip");
}

// Resolve a country code, preferring edge-provided headers (Vercel, Cloudflare)
// and falling back to a local GeoIP lookup for self-hosted / dev environments.
export async function countryFromHeaders(headers: Headers): Promise<string | null> {
  const edgeCountry = headers.get("x-vercel-ip-country") ?? headers.get("cf-ipcountry");
  if (edgeCountry && edgeCountry !== "XX") {
    return edgeCountry.toUpperCase();
  }
  return countryFromIp(clientIpFromHeaders(headers));
}

export async function countryFromIp(ip: string | null): Promise<string | null> {
  if (!ip || isPrivateIp(ip)) return null;

  const lookup = await getLookup();
  if (!lookup) return null;

  try {
    return lookup(ip)?.country ?? null;
  } catch {
    return null;
  }
}

type GeoLookup = (ip: string) => { country?: string } | null;

// geoip-lite is loaded lazily and only when an actual IP lookup is needed. This
// keeps it out of the request path on platforms that supply a geo header
// (Vercel/Cloudflare), and means a missing or trimmed dataset degrades to
// "unknown" instead of crashing the function.
let cachedLookup: Promise<GeoLookup | null> | undefined;

function getLookup(): Promise<GeoLookup | null> {
  if (cachedLookup === undefined) {
    cachedLookup = import("geoip-lite")
      .then((mod) => {
        const candidate = mod as unknown as {
          default?: { lookup?: GeoLookup };
          lookup?: GeoLookup;
        };
        return candidate.default?.lookup ?? candidate.lookup ?? null;
      })
      .catch(() => null);
  }
  return cachedLookup;
}

function isPrivateIp(ip: string): boolean {
  if (ip === "::1" || ip.startsWith("127.") || ip.toLowerCase() === "localhost") {
    return true;
  }
  if (ip.startsWith("10.") || ip.startsWith("192.168.")) return true;
  if (ip.startsWith("172.")) {
    const second = Number(ip.split(".")[1]);
    if (second >= 16 && second <= 31) return true;
  }
  // Unique local IPv6 range fc00::/7.
  if (/^f[cd][0-9a-f]{2}:/i.test(ip)) return true;
  return false;
}
