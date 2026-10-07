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
    expect(sitemap).toMatch(/web\.bobaksranking\.workers\.dev/);
    expect(sitemap).toMatch(/Promise\.allSettled/);
  });

  test("allows public crawling while blocking private or query-driven surfaces", () => {
    const robots = readFileSync("src/app/robots.ts", "utf8");

    expect(robots).toMatch(/allow:\s*["']\/["']/);
    expect(robots).toMatch(/\/api\//);
    expect(robots).toMatch(/\/account/);
    expect(robots).toMatch(/\/saved/);
    expect(robots).toMatch(/\/compare/);
    expect(robots).toMatch(/\/search/);
    expect(robots).toMatch(/sitemap[\s\S]*sitemap\.xml/);
    expect(robots).toMatch(/IS_PREVIEW/);
  });
});
