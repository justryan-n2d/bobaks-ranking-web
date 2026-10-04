import type { RankingPeriod } from "@/lib/api";

export const RANKING_PERIOD_META: Record<
  RankingPeriod,
  { label: string; description: string; scoreLabel: string }
> = {
  live: { label: "Live", description: "The latest player-count snapshot across tracked experiences.", scoreLabel: "Players" },
  weekly: { label: "This Week", description: "Games ranked by their weekly player-count performance.", scoreLabel: "Avg players" },
  monthly: { label: "This Month", description: "Games ranked by their monthly player-count performance.", scoreLabel: "Avg players" },
  yearly: { label: "This Year", description: "Games ranked by their yearly player-count performance.", scoreLabel: "Avg players" },
};

export const RANKING_PERIODS = Object.keys(RANKING_PERIOD_META) as RankingPeriod[];
