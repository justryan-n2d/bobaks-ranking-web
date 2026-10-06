import { describe, expect, it } from "vitest";

import { AD_SLOTS } from "@/lib/monetization";
import { AdSlot } from "@/components/ad-slot";

describe("AdSlot", () => {
  it.each(AD_SLOTS)("has a safe public slot boundary for %s", (slot) => {
    expect(() => AdSlot({ slot })).not.toThrow();
  });

  it("renders nothing while monetization is disabled", () => {
    expect(AdSlot({ slot: "content-top" })).toBeNull();
  });
});
