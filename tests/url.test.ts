import { describe, expect, it } from "vitest";
import { normalizeHttpUrl } from "@/lib/url";

describe("normalizeHttpUrl", () => {
  it("accepts and canonicalizes http(s) URLs", () => {
    expect(normalizeHttpUrl("https://example.com")).toBe("https://example.com/");
    expect(normalizeHttpUrl("http://example.com/a/b?c=1")).toBe("http://example.com/a/b?c=1");
  });

  it("rejects non-http(s) protocols", () => {
    expect(normalizeHttpUrl("ftp://example.com")).toBeNull();
    expect(normalizeHttpUrl("javascript:alert(1)")).toBeNull();
    expect(normalizeHttpUrl("mailto:a@b.com")).toBeNull();
  });

  it("rejects unparseable input", () => {
    expect(normalizeHttpUrl("not a url")).toBeNull();
    expect(normalizeHttpUrl("")).toBeNull();
  });
});
