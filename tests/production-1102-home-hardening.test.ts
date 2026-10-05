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

  it("keeps the home route free of server-side ranking/feed fetches", () => {
    expect(page).not.toContain("getRankings");
    expect(page).not.toContain("getSocialFeed");
    expect(page).toContain("<HomeDiscovery />");
  });

  it("moves live and social data loading behind client-side requests", () => {
    expect(discovery).toContain("<LiveHomeBoard />");
    expect(discovery).toContain("<HomeSocialFeed />");
    expect(liveBoard).toContain("void sync();");
    expect(socialFeed).toContain('fetch("/api/social/feed?period=live"');
    expect(socialRoute).toContain("getSocialFeed");
  });

  it("does not force every page through dynamic root-layout rendering", () => {
    expect(layout).not.toContain('dynamic = "force-dynamic"');
  });
});
