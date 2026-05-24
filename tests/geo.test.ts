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
  it("resolves a known public IP via the offline dataset", () => {
    expect(countryFromIp("8.8.8.8")).toBe("US");
  });

  it("ignores private and loopback addresses", () => {
    expect(countryFromIp("127.0.0.1")).toBeNull();
    expect(countryFromIp("10.1.2.3")).toBeNull();
    expect(countryFromIp("192.168.1.5")).toBeNull();
    expect(countryFromIp("172.16.0.1")).toBeNull();
    expect(countryFromIp("::1")).toBeNull();
    expect(countryFromIp(null)).toBeNull();
  });
});

describe("countryFromHeaders", () => {
  it("prefers the edge-provided country header", () => {
    expect(countryFromHeaders(headers({ "x-vercel-ip-country": "de" }))).toBe("DE");
    expect(countryFromHeaders(headers({ "cf-ipcountry": "gb" }))).toBe("GB");
  });

  it("ignores the placeholder XX and falls back to IP lookup", () => {
    expect(
      countryFromHeaders(headers({ "x-vercel-ip-country": "XX", "x-forwarded-for": "8.8.8.8" })),
    ).toBe("US");
  });
});
