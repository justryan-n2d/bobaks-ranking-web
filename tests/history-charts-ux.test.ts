import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("graph analytics readability", () => {
  const charts = readFileSync(
    resolve(process.cwd(), "src/components/history-charts.tsx"),
    "utf8",
  );

  it("uses compact number notation for mobile player-axis labels", () => {
    expect(charts).toContain('notation: "compact"');
    expect(charts).toContain('compactDisplay: "short"');
    expect(charts).toContain('window.matchMedia("(max-width: 640px)")');
    expect(charts).toContain("formatCompactNumber(value)");
  });

  it("keeps full precision in player tooltips while compacting only the axis", () => {
    expect(charts).toContain("formatter={(value) => [formatNumber(Number(value)), \"Players\"]}");
    expect(charts).toContain("playerTickFormatter");
  });

  it("sets explicit readable colors for axes, grid, and tooltips", () => {
    expect(charts).toContain('fill: "var(--muted-foreground)"');
    expect(charts).toContain('stroke: "var(--border)"');
    expect(charts).toContain('backgroundColor: "var(--card)"');
    expect(charts).toContain('color: "var(--card-foreground)"');
  });

  it("uses the primary accent for both history lines and a visible hover point", () => {
    expect(charts).toContain('stroke="var(--primary)"');
    expect(charts).toContain('activeDot={{ r: 4');
  });

  it("keeps charts usable in narrow layouts", () => {
    expect(charts).toContain("min-w-0 w-full");
    expect(charts).toContain("h-64");
  });
});
