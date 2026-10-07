import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";

describe("route SEO metadata contract", () => {
  test("ranking pages have period-specific canonicals and real 404 behavior", () => {
    const page = readFileSync("src/app/rankings/[period]/page.tsx", "utf8");

    expect(page).toMatch(/const canonicalPath = "\/rankings\/" \+ period/);
    expect(page).toMatch(/openGraph:\s*\{/);
    expect(page).toMatch(/twitter:\s*\{/);
    expect(page).toMatch(/application\/ld\+json/);
    expect(page).toMatch(/robots:\s*\{ index: false, follow: false \}/);
    expect(page).toMatch(/notFound\(\)/);
  });

  test("game pages have stable canonical URLs", () => {
    const page = readFileSync("src/app/game/[id]/page.tsx", "utf8");

    expect(page).toMatch(/const canonicalPath = "\/game\/" \+ encodeURIComponent\(id\)/);
    expect(page).toMatch(/openGraph:\s*\{/);
    expect(page).toMatch(/twitter:\s*\{/);
    expect(page).toMatch(/application\/ld\+json/);
    expect(page).toMatch(/Related ranking pages/);
    for (const path of ["/rankings/live", "/rankings/weekly", "/rankings/monthly", "/rankings/yearly"]) {
      expect(page).toContain(`href="${path}"`);
    }
  });

  test("Google Search Console verification tag remains configured", () => {
    const layout = readFileSync("src/app/layout.tsx", "utf8");

    expect(layout).toContain('name="google-site-verification"');
    expect(layout).toContain("sUJWU9x32VR0FEnIqkOXVa76kUGKqjTllt-_0ZLiSOA");
  });

  test("utility and account surfaces are not indexable", () => {
    for (const path of [
      "src/app/search/page.tsx",
      "src/app/account/page.tsx",
      "src/app/saved/page.tsx",
      "src/app/compare/page.tsx",
    ]) {
      const source = readFileSync(path, "utf8");
      expect(source, path).toMatch(/robots:\s*\{ index: false/);
    }
  });
});
