import { getRankings, type RankingPeriod } from "@/lib/api";
import { RANKING_PERIODS } from "@/lib/ranking";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ period: string }> }) {
  try {
    const { period: rawPeriod } = await params;
    if (!RANKING_PERIODS.includes(rawPeriod as RankingPeriod)) {
      return Response.json({ error: "Invalid period. Use live, weekly, monthly, or yearly." }, { status: 400 });
    }
    const response = await getRankings(rawPeriod as RankingPeriod);
    return Response.json(response, { headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ error: "Ranking data is temporarily unavailable." }, { status: 502 });
  }
}