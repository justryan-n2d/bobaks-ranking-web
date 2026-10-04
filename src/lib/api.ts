export type RankingPeriod = "live" | "weekly" | "monthly" | "yearly";

export type RankingGame = {
  rank: number;
  gameId: string;
  score: number;
  previousRank?: number | null;
  rankChange?: number | null;
  calculatedAt?: string | null;
  game?: {
    name?: string | null;
    creatorName?: string | null;
    iconUrl?: string | null;
    placeId?: number | null;
  } | null;
};

export type RankingResponse = {
  data: RankingGame[];
  updatedAt?: string | null;
  nextCollectionAt?: string | null;
};

const DEFAULT_API_ORIGIN = "https://bobaks-ranking-api-service.ryan-oledan0.workers.dev";

function getApiOrigin() {
  return process.env.BOBAKS_API_ORIGIN?.replace(/\/$/, "") || DEFAULT_API_ORIGIN;
}

const PATHS: Record<RankingPeriod, string> = {
  live: "/api/rankings/live",
  weekly: "/api/rankings/weekly",
  monthly: "/api/rankings/monthly",
  yearly: "/api/rankings/yearly",
};

export async function getRankings(period: RankingPeriod): Promise<RankingResponse> {
  const response = await fetch(getApiOrigin() + PATHS[period], {
    headers: { accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Bobaks API returned HTTP ${response.status}`);
  }

  const payload: unknown = await response.json();
  if (!payload || typeof payload !== "object") {
    throw new Error("Bobaks API returned an invalid payload");
  }

  const candidate = payload as { data?: unknown; updatedAt?: unknown; nextCollectionAt?: unknown };
  if (!Array.isArray(candidate.data)) {
    throw new Error("Bobaks API ranking payload is missing data");
  }

  return {
    data: candidate.data as RankingGame[],
    updatedAt: typeof candidate.updatedAt === "string" ? candidate.updatedAt : null,
    nextCollectionAt: typeof candidate.nextCollectionAt === "string" ? candidate.nextCollectionAt : null,
  };
}
