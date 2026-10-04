import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RankingTable } from "@/components/ranking-table";
import { getRankings, type RankingPeriod } from "@/lib/api";

export const dynamic = "force-dynamic";

const PERIODS: Record<RankingPeriod, string> = {
  live: "Live",
  weekly: "This Week",
  monthly: "This Month",
  yearly: "This Year",
};

const VALID_PERIODS = Object.keys(PERIODS) as RankingPeriod[];

export async function generateMetadata({ params }: { params: Promise<{ period: string }> }) {
  const { period } = await params;
  const label = PERIODS[period as RankingPeriod];
  return label
    ? {
        title: `${label} Roblox Game Rankings`,
        description: `${label} Roblox experience rankings, player counts, and rank movement from Bobaks Ranking.`,
      }
    : { title: "Rankings" };
}

export default async function RankingPeriodPage({ params }: { params: Promise<{ period: string }> }) {
  const { period: rawPeriod } = await params;

  if (!VALID_PERIODS.includes(rawPeriod as RankingPeriod)) {
    return (
      <div className="mx-auto max-w-xl py-20 text-center">
        <h1 className="text-2xl font-black">Ranking period not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">Choose Live, This Week, This Month, or This Year.</p>
      </div>
    );
  }

  const period = rawPeriod as RankingPeriod;
  let response = { data: [], updatedAt: null as string | null };

  try {
    response = await getRankings(period);
  } catch {
    // The page remains available when the upstream API is temporarily unavailable.
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Home
        </Link>
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Bobaks Rankings</div>
        <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">{PERIODS[period]}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Top 100 Roblox experiences for this period, using production ranking data from Bobaks.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground sm:px-5">
        {response.updatedAt
          ? `Data updated ${new Date(response.updatedAt).toLocaleString()}`
          : "Freshness timestamp unavailable"}
      </div>

      <RankingTable games={response.data.slice(0, 100)} />
    </div>
  );
}
