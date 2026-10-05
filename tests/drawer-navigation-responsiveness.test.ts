import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("drawer navigation responsiveness", () => {
  const shell = readFileSync(resolve(process.cwd(), "src/components/site-shell.tsx"), "utf8");
  const loading = readFileSync(resolve(process.cwd(), "src/app/rankings/[period]/loading.tsx"), "utf8");
  const view = readFileSync(resolve(process.cwd(), "src/components/ranking-period-view.tsx"), "utf8");

  it("does not keep a blocking drawer mounted after navigation", () => {
    expect(shell).toContain('import Link, { useLinkStatus } from "next/link";');
    expect(shell).toContain("{open ? (");
    expect(shell).not.toContain("DRAWER_EXIT_MS");
    expect(shell).not.toContain("bobaks-drawer-exit");
    expect(shell).not.toContain("setMounted(false)");
  });

  it("gives navigation and destination content immediate loading feedback", () => {
    expect(shell).toContain("bobaks-nav-pending");
    expect(shell).toContain("useLinkStatus");
    expect(loading).toContain("Loading rankings...");
    expect(loading).toContain("animate-pulse");
    expect(view).toContain("LoadingSkeleton");
  });
});
