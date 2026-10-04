import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  getGame,
  getGameHistory,
  getGamePeak,
  getGameRankHistory,
  getRankings,
  getSocialFeed,
  searchGames,
} from "@/lib/api";
import { isDemoModeEnabled } from "@/lib/demo-data";

describe("preview demo data", () => {
  const originalDeploymentEnv = process.env.BOBAKS_UI_ENV;
  const originalDemoMode = process.env.BOBAKS_UI_DEMO_MODE;

  beforeEach(() => {
    process.env.BOBAKS_UI_ENV = "preview";
    process.env.BOBAKS_UI_DEMO_MODE = "true";
  });

  afterEach(() => {
    if (originalDeploymentEnv === undefined) delete process.env.BOBAKS_UI_ENV;
    else process.env.BOBAKS_UI_ENV = originalDeploymentEnv;

    if (originalDemoMode === undefined) delete process.env.BOBAKS_UI_DEMO_MODE;
    else process.env.BOBAKS_UI_DEMO_MODE = originalDemoMode;
  });

  it("enables demo data only for the preview deployment", async () => {
    process.env.BOBAKS_UI_ENV = "production";
    expect(isDemoModeEnabled()).toBe(false);

    process.env.BOBAKS_UI_ENV = "preview";
    expect(isDemoModeEnabled()).toBe(true);
  });

  it("returns populated ranking periods without calling the live API", async () => {
    for (const period of ["live", "weekly", "monthly", "yearly"] as const) {
      const response = await getRankings(period);
      expect(response.period).toBe(period);
      expect(response.data.length).toBeGreaterThanOrEqual(5);
      expect(response.data[0]?.game.name).toBeTruthy();
      expect(response.data[0]?.score).toBeGreaterThan(0);
    }
  });

  it("returns a social feed and searchable demo games", async () => {
    const feed = await getSocialFeed();
    const results = await searchGames("Island");
    expect(feed.source).toBe("preview-demo");
    expect(feed.ranking.items.length).toBeGreaterThan(0);
    expect(results).toHaveLength(1);
    expect(results[0]?.name).toBe("Island Builders");
  });

  it("returns connected game profile and history data", async () => {
    const game = await getGame("demo-001");
    const history = await getGameHistory("demo-001", 365);
    const rankHistory = await getGameRankHistory("demo-001", 31);
    const peak = await getGamePeak("demo-001");

    expect(game.name).toBe("Filipino Hangout");
    expect(game.isActive).toBe(true);
    expect(history.data.length).toBeGreaterThan(0);
    expect(rankHistory.length).toBeGreaterThan(0);
    expect(peak.peakPlayers).toBeGreaterThan(game.currentPlayers ?? 0);
  });

  it("rejects unknown demo game ids", async () => {
    await expect(getGame("missing-demo-game")).rejects.toThrow("Demo game not found");
  });
});
