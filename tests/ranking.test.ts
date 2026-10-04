import { describe, expect, it } from "vitest";
import { RANKING_PERIOD_META, RANKING_PERIODS } from "../src/lib/ranking";

describe("ranking presentation metadata", () => {
  it("defines every public ranking period", () => {
    expect(RANKING_PERIODS).toEqual(["live", "weekly", "monthly", "yearly"]);
  });

  it("uses current players only for live", () => {
    expect(RANKING_PERIOD_META.live.scoreLabel).toBe("Players");
    expect(RANKING_PERIOD_META.weekly.scoreLabel).toBe("Avg players");
    expect(RANKING_PERIOD_META.monthly.scoreLabel).toBe("Avg players");
    expect(RANKING_PERIOD_META.yearly.scoreLabel).toBe("Avg players");
  });
});
