import type { MetadataRoute } from "next";
import { getRankings, type RankingPeriod } from "@/lib/api";

const SITE_ORIGIN = (
  process.env.BOBAKS_SITE_ORIGIN || "https://web.bobaksranking.workers.dev"
).replace(/\/$/, "");

const INDEXABLE_ROUTES = [
  "/",
  "/rankings/live",
  "/rankings/weekly",
  "/rankings/monthly",
  "/rankings/yearly",
  "/about",
  "/methodology",
  "/privacy",
  "/terms",
] as const;

const RANKING_PERIODS: readonly RankingPeriod[] = [
  "live",
  "weekly",
  "monthly",
  "yearly",
];

export const revalidate = 600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = INDEXABLE_ROUTES.map((path) => ({
    url: SITE_ORIGIN + path,
  }));

  const rankingResults = await Promise.allSettled(
    RANKING_PERIODS.map(async (period) => ({
      period,
      response: await getRankings(period),
    })),
  );

  const gameLastModified = new Map<string, string>();

  for (const result of rankingResults) {
    if (result.status !== "fulfilled") continue;

    for (const game of result.value.response.data) {
      const gameId = String(game.gameId || "").trim();
      if (!/^\d+$/.test(gameId)) continue;

      const current = gameLastModified.get(gameId);
      const candidate = game.calculatedAt || result.value.response.updatedAt || null;

      if (candidate && (!current || Date.parse(candidate) > Date.parse(current))) {
        gameLastModified.set(gameId, candidate);
      } else if (!current) {
        gameLastModified.set(gameId, "");
      }
    }
  }

  const gameEntries: MetadataRoute.Sitemap = Array.from(gameLastModified, ([gameId, lastModified]) => ({
    url: SITE_ORIGIN + "/game/" + encodeURIComponent(gameId),
    ...(lastModified ? { lastModified } : {}),
  }));

  return [...staticEntries, ...gameEntries];
}
