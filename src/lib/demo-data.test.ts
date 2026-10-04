import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  getGame,
  getGameHistory,
  getGamePeak,
  getGameRankHistory,
  getRankings,
  getSocialFeed,
  searchGames,
} from "@/lib/api";

describe("preview demo data", () => {
  beforeEach(() => {
    process.env.BOBAKS_UI_DEMO_MODE = "true";
  });

  afterEach(() => {
    delete process.env.BOBAKS_UI_DEMO_MODE;
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
