import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("production 1102 home hardening", () => {
  const page = readFileSync(resolve(process.cwd(), "src/app/page.tsx"), "utf8");
  const layout = readFileSync(resolve(process.cwd(), "src/app/layout.tsx"), "utf8");
  const discovery = readFileSync(resolve(process.cwd(), "src/components/home-discovery.tsx"), "utf8");
  const liveBoard = readFileSync(resolve(process.cwd(), "src/components/live-home-board.tsx"), "utf8");
  const socialFeed = readFileSync(resolve(process.cwd(), "src/components/home-social-feed.tsx"), "utf8");
  const socialRoute = readFileSync(resolve(process.cwd(), "src/app/api/social/feed/route.ts"), "utf8");

  it("server-renders initial home rankings and social feed data", () => {
    expect(page).toContain("getRankings");
    expect(page).toContain("getSocialFeed");
    expect(page).toContain("<HomeDiscovery");
    expect(page).toContain("initialResponse={rankingResult.status === \"fulfilled\" ? rankingResult.value : null}");
    expect(discovery).toContain("initialGames={initialResponse?.data ?? []}");
    expect(discovery).toContain("<HomeSocialFeed initialFeed={initialFeed} />");
  });

  it("retains client-side live and social refresh after server rendering", () => {
    expect(discovery).toContain("<LiveHomeBoard");
    expect(discovery).toContain("<HomeSocialFeed initialFeed={initialFeed} />");
    expect(liveBoard).toContain("void sync();");
    expect(socialFeed).toContain('fetch("/api/social/feed?period=live"');
    expect(socialRoute).toContain("getSocialFeed");
  });

  it("does not force every page through dynamic root-layout rendering", () => {
    expect(layout).not.toContain('dynamic = "force-dynamic"');
  });
});
