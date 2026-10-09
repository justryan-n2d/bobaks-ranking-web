import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";

describe("SEO discoverability contract", () => {
  test("publishes a production sitemap with public ranking and game routes", () => {
    const sitemap = readFileSync("src/app/sitemap.ts", "utf8");

    expect(sitemap).toMatch(/MetadataRoute\.Sitemap/);
    expect(sitemap).toMatch(/\/rankings\/live/);
    expect(sitemap).toMatch(/\/rankings\/weekly/);
    expect(sitemap).toMatch(/\/rankings\/monthly/);
    expect(sitemap).toMatch(/\/rankings\/yearly/);
    expect(sitemap).toMatch(/\/game\//);
    expect(sitemap).toMatch(/\/community/);
    expect(sitemap).toMatch(/web\.bobaksranking\.workers\.dev/);
    expect(sitemap).toMatch(/Promise\.allSettled/);
    expect(sitemap).toMatch(/dynamic = "force-dynamic"/);
    expect(sitemap).not.toMatch(/revalidate *=/);
  });

  test("allows public crawling while blocking private or query-driven surfaces", () => {
    const robots = readFileSync("src/app/robots.ts", "utf8");

    expect(robots).toMatch(/allow:\s*["']\/["']/);
    expect(robots).toMatch(/\/api\//);
    expect(robots).not.toMatch(/disallow:[\s\S]*\/account/);
    expect(robots).not.toMatch(/disallow:[\s\S]*\/saved/);
    expect(robots).not.toMatch(/disallow:[\s\S]*\/compare/);
    expect(robots).not.toMatch(/disallow:[\s\S]*\/search/);
    expect(robots).toMatch(/sitemap[\s\S]*sitemap\.xml/);
    expect(robots).toMatch(/IS_PREVIEW/);
  });

  test("public pages expose default social metadata", () => {
    const layout = readFileSync("src/app/layout.tsx", "utf8");

    expect(layout).toMatch(/openGraph:\s*\{/);
    expect(layout).toMatch(/twitter:\s*\{/);
    expect(layout).toMatch(/siteName: "Bobaks Ranking"/);
    expect(layout).toMatch(/GOOGLE_SITE_VERIFICATION/);
    expect(layout).toMatch(/google:\s*GOOGLE_SITE_VERIFICATION/);
    expect(layout).toContain("95wMN3wqzeI4-1F8c8l3s_bXFlXtjj1kXK1oGR7aT1o");
    expect(layout).toMatch(/BING_SITE_VERIFICATION/);
    expect(layout).toMatch(/msvalidate\.01/);
  });
});
