import { afterEach, describe, expect, it, vi } from "vitest";

import { getRankings } from "@/lib/api";
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
  const originalDemoMode = process.env.BOBAKS_UI_DEMO_MODE;
  const originalDeploymentEnv = process.env.BOBAKS_DEPLOYMENT_ENV;

  afterEach(() => {
    if (originalDemoMode === undefined) delete process.env.BOBAKS_UI_DEMO_MODE;
    else process.env.BOBAKS_UI_DEMO_MODE = originalDemoMode;

    if (originalDeploymentEnv === undefined) delete process.env.BOBAKS_DEPLOYMENT_ENV;
    else process.env.BOBAKS_DEPLOYMENT_ENV = originalDeploymentEnv;

    vi.unstubAllGlobals();
  });

  it("returns populated deterministic ranking periods", () => {
    process.env.BOBAKS_DEPLOYMENT_ENV = "preview";
    process.env.BOBAKS_UI_DEMO_MODE = "true";

    for (const period of ["live", "weekly", "monthly", "yearly"] as const) {
      const response = getDemoRankings(period);
      expect(response.period).toBe(period);
      expect(response.data.length).toBeGreaterThanOrEqual(5);
      expect(response.data[0]?.game?.name).toBeTruthy();
      expect(response.data.every((item) => item.score > 0)).toBe(true);
    }
  });

  it("provides ranking states needed by the live QA board", () => {
    const live = getDemoRankings("live").data;
    expect(live.some((item) => item.previousRank == null)).toBe(true);
    expect(live.some((item) => Number(item.rankChange) > 0)).toBe(true);
    expect(live.some((item) => Number(item.rankChange) < 0)).toBe(true);
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

  it("rejects unknown demo game ids", () => {
    expect(() => getDemoGameProfile("missing-demo-game")).toThrow("Demo game not found");
  });

  it("enables demo data only for an explicitly configured preview", () => {
    process.env.BOBAKS_UI_DEMO_MODE = "true";
    process.env.BOBAKS_DEPLOYMENT_ENV = "preview";
    expect(isDemoModeEnabled()).toBe(true);

    process.env.BOBAKS_DEPLOYMENT_ENV = "production";
    expect(isDemoModeEnabled()).toBe(false);

    process.env.BOBAKS_DEPLOYMENT_ENV = "preview";
    process.env.BOBAKS_UI_DEMO_MODE = "false";
    expect(isDemoModeEnabled()).toBe(false);
  });

  it("keeps production ranking calls on the real API", async () => {
    process.env.BOBAKS_DEPLOYMENT_ENV = "production";
    process.env.BOBAKS_UI_DEMO_MODE = "true";

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ period: "live", data: [] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await getRankings("live");

    expect(response.data).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("/api/rankings/live");
  });
});
