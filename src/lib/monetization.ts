export const AD_SLOTS = ["content-top", "content-mid", "footer"] as const;

export type AdSlotId = (typeof AD_SLOTS)[number];
export type AdProviderId = "none" | (string & {});

export const MONETIZATION_EVENTS = {
  adImpression: "ad_impression",
  adClick: "ad_click",
  sponsorImpression: "sponsor_impression",
  sponsorClick: "sponsor_click",
} as const;

export type MonetizationEventName =
  (typeof MONETIZATION_EVENTS)[keyof typeof MONETIZATION_EVENTS];

export const CORE_FREE_FEATURES = [
  "live-rankings",
  "historical-rankings",
  "game-search",
  "basic-statistics",
] as const;

export const MONETIZATION_CONFIG = {
  ads: {
    enabledEnvVar: "NEXT_PUBLIC_BOBAKS_ADS_ENABLED",
    providerEnvVar: "NEXT_PUBLIC_BOBAKS_AD_PROVIDER",
  },
  sponsorships: {
    enabled: false,
  },
  premium: {
    enabled: false,
  },
} as const;

function readEnv(name: string): string {
  if (typeof process === "undefined") return "";
  return String(process.env[name] ?? "").trim();
}

export function isAdsEnabled(): boolean {
  return readEnv(MONETIZATION_CONFIG.ads.enabledEnvVar).toLowerCase() === "true";
}

export function getAdProvider(): AdProviderId {
  return readEnv(MONETIZATION_CONFIG.ads.providerEnvVar) || "none";
}

export function isMonetizationReady(): boolean {
  return isAdsEnabled() && getAdProvider() !== "none";
}
