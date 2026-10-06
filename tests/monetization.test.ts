import { beforeEach, describe, expect, it, vi } from "vitest";

describe("Phase 7.1 monetization policy", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    delete process.env.NEXT_PUBLIC_BOBAKS_ADS_ENABLED;
    delete process.env.NEXT_PUBLIC_BOBAKS_AD_PROVIDER;
  });

  it("keeps ads disabled unless the public enable flag is explicitly true", async () => {
    const { isAdsEnabled } = await import("@/lib/monetization");
    expect(isAdsEnabled()).toBe(false);

    vi.stubEnv("NEXT_PUBLIC_BOBAKS_ADS_ENABLED", "true");
    expect(isAdsEnabled()).toBe(true);
  });

  it("allows only non-overlay monetization placements", async () => {
    const { AD_SLOTS } = await import("@/lib/monetization");
    expect(AD_SLOTS).toEqual(["content-top", "content-mid", "footer"]);
    expect(AD_SLOTS.some((slot) => slot.includes("overlay"))).toBe(false);
  });

  it("keeps monetization readiness off while no provider is configured", async () => {
    const { isMonetizationReady } = await import("@/lib/monetization");
    vi.stubEnv("NEXT_PUBLIC_BOBAKS_ADS_ENABLED", "true");
    expect(isMonetizationReady()).toBe(false);
  });

  it("exports stable monetization event names", async () => {
    const { MONETIZATION_EVENTS } = await import("@/lib/monetization");
    expect(MONETIZATION_EVENTS).toEqual({
      adImpression: "ad_impression",
      adClick: "ad_click",
      sponsorImpression: "sponsor_impression",
      sponsorClick: "sponsor_click",
    });
  });
});
