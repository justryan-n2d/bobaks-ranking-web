import { describe, expect, it } from "vitest";

import {
  getDemoGameProfile,
  getDemoHistory,
  getDemoRankHistory,
  getDemoRankings,
  getDemoSocialFeed,
  isDemoModeEnabled,
  searchDemoGames,
} from "@/lib/demo-data";

describe("preview demo data", () => {
  it("returns populated deterministic ranking periods", () => {
    for (const period of ["live", "weekly", "monthly", "yearly"] as const) {
      const response = getDemoRankings(period);
      expect(response.period).toBe(period);
      expect(response.data.length).toBeGreaterThanOrEqual(5);
      expect(response.data[0]?.game?.name).toBeTruthy();
      expect(response.data.every((item) => item.score > 0)).toBe(true);
    }
  });

  it("provides discovery feed content", () => {
    const feed = getDemoSocialFeed();
    expect(feed.source).toBe("preview-demo");
    expect(feed.trending.items.length).toBeGreaterThan(0);
    expect(feed.peaks.items.length).toBeGreaterThan(0);
  });

  it("supports game profile, history, rank history, and search flows", () => {
    const game = getDemoGameProfile("demo-001");
    expect(game.name).toBe("Filipino Hangout");

    const history = getDemoHistory("demo-001", 365);
    expect(history.data.length).toBeGreaterThan(0);
    expect(history.data.every((point) => point.gameId === "demo-001")).toBe(true);

    const rankHistory = getDemoRankHistory("demo-001", 31);
    expect(rankHistory.length).toBeGreaterThan(0);

    expect(searchDemoGames("cafe").some((result) => result.name === "Cozy Cafe")).toBe(true);
  });

  it("does not enable demo mode unless explicitly configured", () => {
    const previousDemoMode = process.env.BOBAKS_UI_DEMO_MODE;
    const previousEnvironment = process.env.BOBAKS_DEPLOYMENT_ENV;

    process.env.BOBAKS_UI_DEMO_MODE = "true";
    process.env.BOBAKS_DEPLOYMENT_ENV = "preview";
    expect(isDemoModeEnabled()).toBe(true);

    process.env.BOBAKS_DEPLOYMENT_ENV = "production";
    expect(isDemoModeEnabled()).toBe(false);

    if (previousDemoMode === undefined) delete process.env.BOBAKS_UI_DEMO_MODE;
    else process.env.BOBAKS_UI_DEMO_MODE = previousDemoMode;
    if (previousEnvironment === undefined) delete process.env.BOBAKS_DEPLOYMENT_ENV;
    else process.env.BOBAKS_DEPLOYMENT_ENV = previousEnvironment;
  });
});
