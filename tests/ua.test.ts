import { describe, expect, it } from "vitest";
import { parseUserAgent } from "@/lib/ua";

const IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const ANDROID =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";
const DESKTOP =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

describe("parseUserAgent", () => {
  it("classifies an iPhone as a mobile Safari / iOS client", () => {
    const result = parseUserAgent(IPHONE);
    expect(result.deviceType).toBe("mobile");
    expect(result.browser).toBe("Mobile Safari");
    expect(result.os).toBe("iOS");
  });

  it("classifies an Android phone as mobile Chrome", () => {
    const result = parseUserAgent(ANDROID);
    expect(result.deviceType).toBe("mobile");
    expect(result.browser).toBe("Chrome");
    expect(result.os).toBe("Android");
  });

  it("treats a desktop browser (no device type) as desktop", () => {
    const result = parseUserAgent(DESKTOP);
    expect(result.deviceType).toBe("desktop");
    expect(result.browser).toBe("Chrome");
  });

  it("handles a missing user-agent gracefully", () => {
    expect(parseUserAgent(null)).toEqual({ deviceType: "unknown", browser: null, os: null });
  });
});
