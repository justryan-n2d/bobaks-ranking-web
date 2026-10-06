import { afterEach, describe, expect, it, vi } from "vitest";

import { AD_SLOTS } from "@/lib/monetization";
import { AdSlot } from "@/components/ad-slot";

afterEach(() => {
  vi.unstubAllEnvs();
  delete process.env.NEXT_PUBLIC_BOBAKS_ADS_ENABLED;
  delete process.env.NEXT_PUBLIC_BOBAKS_AD_PROVIDER;
});

describe("AdSlot", () => {
  it.each(AD_SLOTS)("has a safe public slot boundary for %s", (slot) => {
    expect(() => AdSlot({ slot })).not.toThrow();
  });

  it("renders nothing while monetization is disabled", () => {
    expect(AdSlot({ slot: "content-top", children: "future provider" })).toBeNull();
  });

  it("passes future provider content through a labeled slot when ready", () => {
    vi.stubEnv("NEXT_PUBLIC_BOBAKS_ADS_ENABLED", "true");
    vi.stubEnv("NEXT_PUBLIC_BOBAKS_AD_PROVIDER", "test-provider");

    const element = AdSlot({
      slot: "content-top",
      children: "future provider",
    });

    expect(element).not.toBeNull();
    expect(element?.props["data-bobaks-ad-slot"]).toBe("content-top");
    expect(element?.props["aria-label"]).toBe("Advertisement");
  });
});
