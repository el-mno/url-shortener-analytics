import { describe, expect, it } from "vitest";
import { countryLabel } from "@/lib/country";

describe("countryLabel", () => {
  it("renders a flag emoji and English name for a valid code", () => {
    const label = countryLabel("US");
    expect(label).toContain("United States");
    expect(label).toContain("🇺🇸");
  });

  it("is case-insensitive", () => {
    expect(countryLabel("de")).toContain("Germany");
  });

  it("falls back to Unknown for the synthetic bucket and bad input", () => {
    expect(countryLabel("Unknown")).toBe("Unknown");
    expect(countryLabel("")).toBe("Unknown");
    expect(countryLabel("ZZZ")).toBe("Unknown");
  });
});
