import { describe, expect, it } from "vitest";
import { clientIpFromHeaders, countryFromHeaders, countryFromIp } from "@/lib/geo";

function headers(init: Record<string, string>): Headers {
  return new Headers(init);
}

describe("clientIpFromHeaders", () => {
  it("prefers the first entry of x-forwarded-for", () => {
    expect(clientIpFromHeaders(headers({ "x-forwarded-for": "8.8.8.8, 10.0.0.1" }))).toBe("8.8.8.8");
  });

  it("falls back to x-real-ip", () => {
    expect(clientIpFromHeaders(headers({ "x-real-ip": "1.1.1.1" }))).toBe("1.1.1.1");
  });

  it("returns null when no IP headers are present", () => {
    expect(clientIpFromHeaders(headers({}))).toBeNull();
  });
});

describe("countryFromIp", () => {
  it("resolves a known public IP via the offline dataset", async () => {
    expect(await countryFromIp("8.8.8.8")).toBe("US");
  });

  it("ignores private and loopback addresses", async () => {
    expect(await countryFromIp("127.0.0.1")).toBeNull();
    expect(await countryFromIp("10.1.2.3")).toBeNull();
    expect(await countryFromIp("192.168.1.5")).toBeNull();
    expect(await countryFromIp("172.16.0.1")).toBeNull();
    expect(await countryFromIp("::1")).toBeNull();
    expect(await countryFromIp(null)).toBeNull();
  });
});

describe("countryFromHeaders", () => {
  it("prefers the edge-provided country header", async () => {
    expect(await countryFromHeaders(headers({ "x-vercel-ip-country": "de" }))).toBe("DE");
    expect(await countryFromHeaders(headers({ "cf-ipcountry": "gb" }))).toBe("GB");
  });

  it("ignores the placeholder XX and falls back to IP lookup", async () => {
    expect(
      await countryFromHeaders(headers({ "x-vercel-ip-country": "XX", "x-forwarded-for": "8.8.8.8" })),
    ).toBe("US");
  });
});
