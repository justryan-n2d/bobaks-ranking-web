import { describe, expect, it } from "vitest";
import { NAV_ITEMS } from "@/lib/navigation";

describe("Bobaks navigation contract", () => {
  it("contains the locked primary routes in order", () => {
    expect(NAV_ITEMS.map((item) => item.href)).toEqual([
      "/",
      "/rankings/live",
      "/rankings/weekly",
      "/rankings/monthly",
      "/rankings/yearly",
      "/search",
      "/saved",
      "/compare",
      "/community",
      "/about",
      "/methodology",
      "/privacy",
      "/terms",
    ]);
  });

  it("does not define duplicate routes", () => {
    const hrefs = NAV_ITEMS.map((item) => item.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });
});
