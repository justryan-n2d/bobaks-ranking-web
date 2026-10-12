import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("ranking page 1102 hardening", () => {
  const page = readFileSync(resolve(process.cwd(), "src/app/rankings/[period]/page.tsx"), "utf8");
  const view = readFileSync(resolve(process.cwd(), "src/components/ranking-period-view.tsx"), "utf8");
  const loading = readFileSync(resolve(process.cwd(), "src/app/rankings/[period]/loading.tsx"), "utf8");
  const api = readFileSync(resolve(process.cwd(), "src/app/api/rankings/[period]/route.ts"), "utf8");

  it("server-renders initial ranking data and still supports client refresh", () => {
    expect(page).toContain("await getRankings(period)");
    expect(page).toContain("<RankingPeriodView");
    expect(page).toContain("initialResponse={initialResponse}");
    expect(view).toContain("useState<RankingResponse | null>(initialResponse)");
  });

  it("loads ranking data after hydration with a visible loading state", () => {
    expect(view).toContain("useEffect");
    expect(view).toContain("/api/rankings/");
    expect(view).toContain("Loading rankings");
    expect(view).toContain("Try again");
    expect(loading).toContain("animate-spin");
  });

  it("provides a same-origin ranking API proxy for every period", () => {
    expect(api).toContain("getRankings");
    expect(api).toContain("RANKING_PERIODS");
    expect(api).toContain("force-dynamic");
  });
});