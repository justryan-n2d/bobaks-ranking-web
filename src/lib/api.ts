import {
  getDemoGameProfile,
  getDemoHistory,
  getDemoPeak,
  getDemoRankHistory,
  getDemoRankings,
  getDemoSocialFeed,
  isDemoModeEnabled,
  searchDemoGames,
} from "@/lib/demo-data";

export type RankingPeriod = "live" | "weekly" | "monthly" | "yearly";

export type RankingGame = {
  id?: string | number;
  rank: number;
  gameId: string;
  score: number;
  previousRank?: number | null;
  rankChange?: number | null;
  calculatedAt?: string | null;
  game?: {
    id?: string | number;
    name?: string | null;
    creatorName?: string | null;
    iconUrl?: string | null;
    placeId?: number | null;
  } | null;
};

export type RankingResponse = {
  period?: string;
  data: RankingGame[];
  updatedAt?: string | null;
  refreshIntervalSeconds?: number | null;
  nextCollectionAt?: string | null;
  nextRefreshAt?: string | null;
};

export type GameRankingSummary = {
  rank?: number;
  score?: number;
  previousRank?: number | null;
  rankChange?: number | null;
  calculatedAt?: string | null;
};

export type GameProfile = {
  id: string;
  universeId?: string | number | null;
  placeId?: number | null;
  name?: string | null;
  creatorName?: string | null;
  creatorId?: string | number | null;
  iconUrl?: string | null;
  description?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  isActive?: boolean | null;
  currentPlayers?: number | null;
  currentSnapshotAt?: string | null;
  rankings?: Record<string, GameRankingSummary>;
};

export type HistoryPoint = {
  id: string | number;
  gameId: string;
  playerCount: number;
  timestamp: string;
  averagePlayers?: number | null;
  peakPlayers?: number | null;
  lowestPlayers?: number | null;
  totalSamples?: number | null;
  resolution?: "snapshot" | "daily" | null;
};

export type HistoryResponse = {
  gameId: string;
  days: number;
  resolution: "snapshot" | "mixed" | "daily";
  data: HistoryPoint[];
};

export type RankHistoryPoint = {
  date: string;
  rank: number;
  averagePlayers: number;
  gamesRanked: number;
};

export type PeakResponse = {
  id?: string | number;
  gameId?: string | number;
  peakPlayers: number;
  peakAt: string | null;
};

export type SearchGame = {
  id: string | number;
  universeId?: string | number | null;
  placeId?: number | null;
  name?: string | null;
  creatorName?: string | null;
  creatorId?: string | number | null;
  iconUrl?: string | null;
  description?: string | null;
  isActive?: boolean | null;
};

export type SocialFeedItem = {
  rank?: number;
  gameId: string;
  name: string;
  creator?: string;
  score: number;
  rankChange?: number | null;
  peakPlayers?: number;
  peakAt?: string | null;
  url?: string;
};

export type SocialFeed = {
  generatedAt: string;
  source: string;
  period: string;
  ranking: {
    title: string;
    path: string;
    items: SocialFeedItem[];
  };
  trending: {
    title: string;
    path: string;
    items: SocialFeedItem[];
  };
  peaks: {
    title: string;
    items: SocialFeedItem[];
    recentItems: SocialFeedItem[];
  };
};

const DEFAULT_API_ORIGIN = "https://bobaks-ranking-api-service.ryan-oledan0.workers.dev";

function getApiOrigin() {
  return process.env.BOBAKS_API_ORIGIN?.replace(/\/$/, "") || DEFAULT_API_ORIGIN;
}

function apiUrl(path: string) {
  return getApiOrigin() + path;
}

async function readJson(response: Response): Promise<unknown> {
  const payload: unknown = await response.json();
  if (!payload || typeof payload !== "object") {
    throw new Error("Bobaks API returned an invalid payload");
  }
  return payload;
}

async function fetchJson(path: string): Promise<Record<string, unknown>> {
  const response = await fetch(apiUrl(path), {
    headers: { accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    const error = new Error(`Bobaks API returned HTTP ${response.status}`);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  const payload = await readJson(response);
  return payload as Record<string, unknown>;
}

const RANKING_PATHS: Record<RankingPeriod, string> = {
  live: "/api/rankings/live",
  weekly: "/api/rankings/weekly",
  monthly: "/api/rankings/monthly",
  yearly: "/api/rankings/yearly",
};

export async function getRankings(period: RankingPeriod): Promise<RankingResponse> {
  if (isDemoModeEnabled()) return getDemoRankings(period);

  const candidate = await fetchJson(RANKING_PATHS[period]);
  if (!Array.isArray(candidate.data)) {
    throw new Error("Bobaks API ranking payload is missing data");
  }

  return {
    period: typeof candidate.period === "string" ? candidate.period : period,
    data: candidate.data as RankingGame[],
    updatedAt: typeof candidate.updatedAt === "string" ? candidate.updatedAt : null,
    refreshIntervalSeconds:
      typeof candidate.refreshIntervalSeconds === "number" ? candidate.refreshIntervalSeconds : null,
    nextCollectionAt:
      typeof candidate.nextCollectionAt === "string" ? candidate.nextCollectionAt : null,
    nextRefreshAt:
      typeof candidate.nextRefreshAt === "string" ? candidate.nextRefreshAt : null,
  };
}

export async function getSocialFeed(period: RankingPeriod = "live"): Promise<SocialFeed> {
  if (isDemoModeEnabled()) return getDemoSocialFeed();

  const candidate = await fetchJson(`/api/social/feed?period=${encodeURIComponent(period)}`);
  if (!candidate.ranking || typeof candidate.ranking !== "object") {
    throw new Error("Bobaks API social feed payload is missing ranking");
  }

  return candidate as SocialFeed;
}

export async function getGame(id: string): Promise<GameProfile> {
  if (isDemoModeEnabled()) return getDemoGameProfile(id);

  const candidate = await fetchJson(`/api/games/${encodeURIComponent(id)}`);
  if (!candidate.data || typeof candidate.data !== "object") {
    throw new Error("Bobaks API game payload is missing data");
  }
  return candidate.data as GameProfile;
}

export async function getGameHistory(id: string, days = 365): Promise<HistoryResponse> {
  if (isDemoModeEnabled()) return getDemoHistory(id, days);

  const candidate = await fetchJson(
    `/api/games/${encodeURIComponent(id)}/history?days=${encodeURIComponent(days)}`,
  );
  if (!Array.isArray(candidate.data)) {
    throw new Error("Bobaks API history payload is missing data");
  }

  return {
    gameId: String(candidate.gameId ?? id),
    days: Number(candidate.days ?? days),
    resolution:
      candidate.resolution === "daily" || candidate.resolution === "mixed"
        ? candidate.resolution
        : "snapshot",
    data: candidate.data as HistoryPoint[],
  };
}

export async function getGameRankHistory(id: string, days = 31): Promise<RankHistoryPoint[]> {
  if (isDemoModeEnabled()) return getDemoRankHistory(id, days);

  const candidate = await fetchJson(
    `/api/games/${encodeURIComponent(id)}/rank-history?days=${encodeURIComponent(days)}`,
  );
  if (!Array.isArray(candidate.data)) {
    throw new Error("Bobaks API rank history payload is missing data");
  }
  return candidate.data as RankHistoryPoint[];
}

export async function getGamePeak(id: string): Promise<PeakResponse> {
  if (isDemoModeEnabled()) return getDemoPeak(id);

  const candidate = await fetchJson(`/api/games/${encodeURIComponent(id)}/peak`);
  if (!candidate.data || typeof candidate.data !== "object") {
    throw new Error("Bobaks API peak payload is missing data");
  }
  return candidate.data as PeakResponse;
}

export async function searchGames(query: string): Promise<SearchGame[]> {
  if (isDemoModeEnabled()) return searchDemoGames(query);

  const candidate = await fetchJson(`/api/search?q=${encodeURIComponent(query)}`);
  if (!Array.isArray(candidate.data)) {
    throw new Error("Bobaks API search payload is missing data");
  }
  return candidate.data as SearchGame[];
}

export function getErrorStatus(error: unknown): number | null {
  return error && typeof error === "object" && "status" in error
    ? typeof (error as { status?: unknown }).status === "number"
      ? (error as { status: number }).status
      : null
    : null;
}
