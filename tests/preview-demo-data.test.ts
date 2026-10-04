import { afterEach, describe, expect, it } from "vitest";

import {
  getDemoGameProfile,
  getDemoHistory,
  getDemoRankHistory,
  getDemoRankings,
  getDemoSocialFeed,
  isDemoModeEnabled,
  searchDemoGames,
} from "../src/lib/demo-data";

describe("preview demo data mode", () => {
  const originalDemoMode = process.env.BOBAKS_UI_DEMO_MODE;
  const originalDeploymentEnv = process.env.BOBAKS_DEPLOYMENT_ENV;

  afterEach(() => {
    if (originalDemoMode === undefined) delete process.env.BOBAKS_UI_DEMO_MODE;
    else process.env.BOBAKS_UI_DEMO_MODE = originalDemoMode;

    if (originalDeploymentEnv === undefined) delete process.env.BOBAKS_DEPLOYMENT_ENV;
    else process.env.BOBAKS_DEPLOYMENT_ENV = originalDeploymentEnv;
  });

  it("provides populated ranking data for every period", () => {
    for (const period of ["live", "weekly", "monthly", "yearly"] as const) {
      const response = getDemoRankings(period);

      expect(response.period).toBe(period);
      expect(response.data.length).toBeGreaterThanOrEqual(5);
      expect(response.data.every((item) => item.score > 0)).toBe(true);
    }
  });

  it("covers discovery, search, profile, history, and peak-facing data", () => {
    const feed = getDemoSocialFeed();
    expect(feed.source).toBe("preview-demo");
    expect(feed.trending.items.length).toBeGreaterThan(0);
    expect(feed.peaks.items.length).toBeGreaterThan(0);

    expect(searchDemoGames("cafe").some((game) => game.id === "demo-006")).toBe(true);

    const profile = getDemoGameProfile("demo-001");
    expect(profile.name).toBe("Filipino Hangout");
    expect(profile.currentPlayers).toBeGreaterThan(0);

    const history = getDemoHistory("demo-001", 365);
    expect(history.data.length).toBeGreaterThan(0);
    expect(history.data.every((point) => point.gameId === "demo-001")).toBe(true);

    const rankHistory = getDemoRankHistory("demo-001", 31);
    expect(rankHistory.length).toBeGreaterThan(0);
  });

  it("enables demo data only for preview deployments", () => {
    process.env.BOBAKS_DEPLOYMENT_ENV = "preview";
    process.env.BOBAKS_UI_DEMO_MODE = "true";
    expect(isDemoModeEnabled()).toBe(true);

    process.env.BOBAKS_DEPLOYMENT_ENV = "production";
    expect(isDemoModeEnabled()).toBe(false);

    process.env.BOBAKS_DEPLOYMENT_ENV = "preview";
    process.env.BOBAKS_UI_DEMO_MODE = "false";
    expect(isDemoModeEnabled()).toBe(false);
  });
});
