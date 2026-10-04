import type {
  GameProfile,
  HistoryPoint,
  HistoryResponse,
  PeakResponse,
  RankHistoryPoint,
  RankingGame,
  RankingPeriod,
  RankingResponse,
  SearchGame,
  SocialFeed,
} from "./api";

const DEMO_UPDATED_AT = "2026-10-05T00:00:00.000Z";

type DemoGame = {
  id: string;
  universeId: string;
  placeId: number;
  name: string;
  creatorName: string;
  creatorId: string;
  iconUrl: string;
  description: string;
  currentPlayers: number;
  peakPlayers: number;
  peakAt: string;
  isActive: boolean;
};

const DEMO_GAMES: DemoGame[] = [
  {
    id: "demo-001",
    universeId: "900000001",
    placeId: 910000001,
    name: "Filipino Hangout",
    creatorName: "Boba Studio",
    creatorId: "800000001",
    iconUrl: "https://placehold.co/128x128/png?text=FH",
    description: "A relaxed social hangout for meeting new friends and chatting.",
    currentPlayers: 18420,
    peakPlayers: 24110,
    peakAt: "2026-10-03T14:20:00.000Z",
    isActive: true,
  },
  {
    id: "demo-002",
    universeId: "900000002",
    placeId: 910000002,
    name: "Island Builders",
    creatorName: "Sunset Labs",
    creatorId: "800000002",
    iconUrl: "https://placehold.co/128x128/png?text=IB",
    description: "Build, expand, and decorate your own tropical island.",
    currentPlayers: 15760,
    peakPlayers: 19880,
    peakAt: "2026-10-04T09:40:00.000Z",
    isActive: true,
  },
  {
    id: "demo-003",
    universeId: "900000003",
    placeId: 910000003,
    name: "Pet Garden",
    creatorName: "Green Pixel",
    creatorId: "800000003",
    iconUrl: "https://placehold.co/128x128/png?text=PG",
    description: "Grow a garden, collect pets, and trade with other players.",
    currentPlayers: 12140,
    peakPlayers: 17650,
    peakAt: "2026-10-02T16:05:00.000Z",
    isActive: true,
  },
  {
    id: "demo-004",
    universeId: "900000004",
    placeId: 910000004,
    name: "Skyline Racers",
    creatorName: "Cloud Nine Games",
    creatorId: "800000004",
    iconUrl: "https://placehold.co/128x128/png?text=SR",
    description: "Race through a bright city skyline and unlock faster cars.",
    currentPlayers: 9340,
    peakPlayers: 15120,
    peakAt: "2026-09-30T12:30:00.000Z",
    isActive: true,
  },
  {
    id: "demo-005",
    universeId: "900000005",
    placeId: 910000005,
    name: "Mystery Mansion",
    creatorName: "Night Owl Interactive",
    creatorId: "800000005",
    iconUrl: "https://placehold.co/128x128/png?text=MM",
    description: "Explore a mysterious mansion and solve clues with friends.",
    currentPlayers: 7820,
    peakPlayers: 11340,
    peakAt: "2026-09-29T18:15:00.000Z",
    isActive: true,
  },
  {
    id: "demo-006",
    universeId: "900000006",
    placeId: 910000006,
    name: "Cozy Cafe",
    creatorName: "Warm Cup Games",
    creatorId: "800000006",
    iconUrl: "https://placehold.co/128x128/png?text=CC",
    description: "Run a cozy cafe and meet other players.",
    currentPlayers: 6410,
    peakPlayers: 8900,
    peakAt: "2026-09-27T10:10:00.000Z",
    isActive: true,
  },
  {
    id: "demo-007",
    universeId: "900000007",
    placeId: 910000007,
    name: "Dungeon Sprint",
    creatorName: "Red Torch",
    creatorId: "800000007",
    iconUrl: "https://placehold.co/128x128/png?text=DS",
    description: "Clear fast dungeons, collect loot, and climb the leaderboard.",
    currentPlayers: 4880,
    peakPlayers: 10200,
    peakAt: "2026-09-25T21:00:00.000Z",
    isActive: true,
  },
  {
    id: "demo-008",
    universeId: "900000008",
    placeId: 910000008,
    name: "Sunset Roleplay",
    creatorName: "Harbor Works",
    creatorId: "800000008",
    iconUrl: "https://placehold.co/128x128/png?text=SRP",
    description: "A casual city roleplay experience with jobs and homes.",
    currentPlayers: 3520,
    peakPlayers: 7600,
    peakAt: "2026-09-24T15:45:00.000Z",
    isActive: true,
  },
];

const PERIOD_OFFSETS: Record<RankingPeriod, number> = {
  live: 0,
  weekly: 1,
  monthly: 2,
  yearly: 3,
};

function scoreFor(game: DemoGame, period: RankingPeriod, index: number) {
  const multiplier = period === "live" ? 1 : period === "weekly" ? 0.92 : period === "monthly" ? 0.86 : 0.78;
  return Math.round(game.currentPlayers * multiplier - index * 173);
}

function rankingFor(period: RankingPeriod): RankingResponse {
  const offset = PERIOD_OFFSETS[period];
  const games = [...DEMO_GAMES]
    .sort((a, b) => scoreFor(b, period, 0) - scoreFor(a, period, 0))
    .map((game, index): RankingGame => {
      const rank = index + 1;
      const rankChange = ((index + offset) % 4) - 1;
      return {
        id: game.id,
        rank,
        gameId: game.id,
        score: scoreFor(game, period, index),
        previousRank: Math.max(1, rank + rankChange),
        rankChange,
        calculatedAt: DEMO_UPDATED_AT,
        game: {
          id: game.id,
          name: game.name,
          creatorName: game.creatorName,
          iconUrl: game.iconUrl,
          placeId: game.placeId,
        },
      };
    });

  return {
    period,
    data: games,
    updatedAt: DEMO_UPDATED_AT,
    refreshIntervalSeconds: 30,
    nextCollectionAt: "2026-10-05T00:05:00.000Z",
    nextRefreshAt: "2026-10-05T00:00:30.000Z",
  };
}

function socialFeed(period: RankingPeriod = "live"): SocialFeed {
  const ranking = rankingFor(period).data;
  const items = ranking.slice(0, 5).map((item): SocialFeed["ranking"]["items"][number] => {
    const game = DEMO_GAMES.find((candidate) => candidate.id === item.gameId)!;
    return {
      rank: item.rank,
      gameId: game.id,
      name: game.name,
      creator: game.creatorName,
      score: item.score,
      rankChange: item.rankChange,
      peakPlayers: game.peakPlayers,
      peakAt: game.peakAt,
      url: "/games/" + encodeURIComponent(game.id),
    };
  });

  return {
    generatedAt: DEMO_UPDATED_AT,
    source: "preview-demo",
    period,
    ranking: {
      title: "Live ranking",
      path: `/rankings/${period}`,
      items,
    },
    trending: {
      title: "Trending",
      path: `/rankings/${period}`,
      items: [...items].reverse(),
    },
    peaks: {
      title: "Peak records",
      items: items.slice(0, 3),
      recentItems: items.slice(2, 5),
    },
  };
}

function getDemoGame(id: string): DemoGame {
  const game = DEMO_GAMES.find((candidate) => candidate.id === id);
  if (!game) throw new Error("Demo game not found");
  return game;
}

function gameProfile(game: DemoGame): GameProfile {
  const liveRank = rankingFor("live").data.find((item) => item.gameId === game.id);
  return {
    id: game.id,
    universeId: game.universeId,
    placeId: game.placeId,
    name: game.name,
    creatorName: game.creatorName,
    creatorId: game.creatorId,
    iconUrl: game.iconUrl,
    description: game.description,
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: DEMO_UPDATED_AT,
    isActive: game.isActive,
    currentPlayers: game.currentPlayers,
    currentSnapshotAt: DEMO_UPDATED_AT,
    rankings: Object.fromEntries(
      (["live", "weekly", "monthly", "yearly"] as RankingPeriod[]).map((period) => {
        const summary = rankingFor(period).data.find((item) => item.gameId === game.id);
        return [
          period,
          summary
            ? {
                rank: summary.rank,
                score: summary.score,
                previousRank: summary.previousRank,
                rankChange: summary.rankChange,
                calculatedAt: DEMO_UPDATED_AT,
              }
            : undefined,
        ];
      }),
    ),
  };
}

function historyFor(game: DemoGame, days: number): HistoryResponse {
  const points: HistoryPoint[] = Array.from({ length: Math.min(days, 14) }, (_, index) => {
    const timestamp = new Date(Date.parse(DEMO_UPDATED_AT) - (13 - index) * 86_400_000).toISOString();
    const variation = ((index * 791 + Number(game.id.slice(-3))) % 2200) - 1100;
    const playerCount = Math.max(250, game.currentPlayers + variation - (13 - index) * 180);
    return {
      id: game.id + "-history-" + index,
      gameId: game.id,
      playerCount,
      timestamp,
      averagePlayers: Math.round(playerCount * 0.96),
      peakPlayers: Math.round(playerCount * 1.18),
      lowestPlayers: Math.round(playerCount * 0.62),
      totalSamples: 48,
      resolution: "snapshot",
    };
  });

  return { gameId: game.id, days, resolution: "snapshot", data: points };
}

function rankHistoryFor(game: DemoGame, days: number): RankHistoryPoint[] {
  const liveRank = rankingFor("live").data.find((item) => item.gameId === game.id)?.rank ?? 8;
  return Array.from({ length: Math.min(days, 14) }, (_, index) => ({
    date: new Date(Date.parse(DEMO_UPDATED_AT) - (13 - index) * 86_400_000).toISOString().slice(0, 10),
    rank: Math.max(1, Math.min(DEMO_GAMES.length, liveRank + ((index % 5) - 2))),
    averagePlayers: Math.max(250, Math.round(game.currentPlayers * (0.78 + index * 0.018))),
    gamesRanked: DEMO_GAMES.length,
  }));
}

export function isDemoModeEnabled() {
  return (
    process.env.BOBAKS_UI_DEMO_MODE === "true" &&
    process.env.BOBAKS_DEPLOYMENT_ENV === "preview"
  );
}

export function getDemoRankings(period: RankingPeriod) {
  return rankingFor(period);
}

export function getDemoSocialFeed(period: RankingPeriod = "live") {
  return socialFeed(period);
}

export function getDemoGameProfile(id: string) {
  return gameProfile(getDemoGame(id));
}

export function getDemoHistory(id: string, days = 365) {
  return historyFor(getDemoGame(id), days);
}

export function getDemoRankHistory(id: string, days = 31) {
  return rankHistoryFor(getDemoGame(id), days);
}

export function getDemoPeak(id: string): PeakResponse {
  const game = getDemoGame(id);
  return { id: game.id, gameId: game.id, peakPlayers: game.peakPlayers, peakAt: game.peakAt };
}

export function searchDemoGames(query: string): SearchGame[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  return DEMO_GAMES
    .filter((game) => (game.name + " " + game.creatorName).toLowerCase().includes(normalized))
    .map((game) => ({
      id: game.id,
      universeId: game.universeId,
      placeId: game.placeId,
      name: game.name,
      creatorName: game.creatorName,
      creatorId: game.creatorId,
      iconUrl: game.iconUrl,
      description: game.description,
      isActive: game.isActive,
    }));
}
