import { describe, expect, it } from "vitest";
import { generateSlug, isValidCustomSlug } from "@/lib/slug";

describe("generateSlug", () => {
  it("produces a 7-character slug from the unambiguous alphabet", () => {
    const slug = generateSlug();
    expect(slug).toHaveLength(7);
    expect(slug).toMatch(/^[23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ]+$/);
  });

  it("never includes look-alike characters", () => {
    const joined = Array.from({ length: 200 }, generateSlug).join("");
    expect(joined).not.toMatch(/[01OIl]/);
  });

  it("is overwhelmingly likely to be unique across many calls", () => {
    const slugs = new Set(Array.from({ length: 1000 }, generateSlug));
    expect(slugs.size).toBe(1000);
  });
});

describe("isValidCustomSlug", () => {
  it("accepts letters, numbers, hyphens and underscores within length bounds", () => {
    expect(isValidCustomSlug("promo")).toBe(true);
    expect(isValidCustomSlug("my-link_2026")).toBe(true);
    expect(isValidCustomSlug("abc")).toBe(true);
  });

  it("rejects too-short, too-long, and illegal characters", () => {
    expect(isValidCustomSlug("ab")).toBe(false);
    expect(isValidCustomSlug("a".repeat(33))).toBe(false);
    expect(isValidCustomSlug("has spaces")).toBe(false);
    expect(isValidCustomSlug("emoji😀")).toBe(false);
    expect(isValidCustomSlug("slash/slash")).toBe(false);
  });

  it("rejects reserved words that would shadow real routes", () => {
    expect(isValidCustomSlug("api")).toBe(false);
    expect(isValidCustomSlug("dashboard")).toBe(false);
    expect(isValidCustomSlug("DASHBOARD")).toBe(false);
  });
});
