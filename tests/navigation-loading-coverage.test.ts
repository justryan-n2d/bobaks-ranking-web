import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("navigation loading coverage", () => {
  const routes = [
    "src/app/rankings/[period]/loading.tsx",
    "src/app/search/loading.tsx",
    "src/app/compare/loading.tsx",
    "src/app/game/[id]/loading.tsx",
  ];

  it("has route-level skeletons for data-heavy navigations", () => {
    for (const route of routes) {
      expect(existsSync(resolve(process.cwd(), route)), route).toBe(true);
      const content = readFileSync(resolve(process.cwd(), route), "utf8");
      expect(content).toContain("animate-pulse");
      expect(content).toContain("role=\"status\"");
    }
  });

  it("keeps lightweight information routes free of unnecessary API work", () => {
    const lightweight = [
      "src/app/account/page.tsx",
      "src/app/community/page.tsx",
      "src/app/about/page.tsx",
      "src/app/methodology/page.tsx",
      "src/app/privacy/page.tsx",
      "src/app/terms/page.tsx",
    ];

    for (const route of lightweight) {
      const content = readFileSync(resolve(process.cwd(), route), "utf8");
      expect(content).not.toContain('from "@/lib/api"');
    }
  });
});
