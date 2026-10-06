import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Compare search surface", () => {
  const selector = readFileSync(
    resolve(process.cwd(), "src/components/game-selector.tsx"),
    "utf8",
  );

  it("keeps the search dropdown opaque and above surrounding content", () => {
    expect(selector).toContain("z-50");
    expect(selector).toContain("bg-[var(--card)]");
    expect(selector).toContain("shadow-2xl");
    expect(selector).toContain("ring-1 ring-black/20");
  });

  it("separates the search field from the result list", () => {
    expect(selector).toContain("bg-[var(--surface-2)]");
    expect(selector).toContain("bg-[var(--card)]");
  });

  it("gives suggestion rows a clear interactive surface", () => {
    expect(selector).toContain("hover:bg-[var(--accent)]");
    expect(selector).toContain("focus-visible:bg-[var(--accent)]");
  });
});
