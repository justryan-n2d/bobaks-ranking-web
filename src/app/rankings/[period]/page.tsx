import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { RankingPeriodView } from "@/components/ranking-period-view";
import type { RankingPeriod } from "@/lib/api";
import { RANKING_PERIOD_META, RANKING_PERIODS } from "@/lib/ranking";

export async function generateMetadata({ params }: { params: Promise<{ period: string }> }) {
  const { period } = await params;
  const meta = RANKING_PERIOD_META[period as RankingPeriod];
  return meta
    ? {
        title: meta.label + " Roblox Game Rankings",
        description: meta.description + " Bobaks Ranking.",
        alternates: { canonical: "/rankings/" + period },
      }
    : {
        title: "Rankings",
        robots: { index: false, follow: false },
      };
}

export default async function RankingPeriodPage({ params }: { params: Promise<{ period: string }> }) {
  const { period: rawPeriod } = await params;
  if (!RANKING_PERIODS.includes(rawPeriod as RankingPeriod)) {
    notFound();
  }
  const period = rawPeriod as RankingPeriod;
  const meta = RANKING_PERIOD_META[period];
  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" aria-hidden="true" />Home</Link>
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Bobaks Rankings</div>
        <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">{meta.label}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{meta.description}</p>
      </div>
      <nav aria-label="Ranking periods" className="flex gap-2 overflow-x-auto pb-1">
        {RANKING_PERIODS.map((item) => {
          const itemMeta = RANKING_PERIOD_META[item];
          const active = item === period;
          return <Link key={item} href={"/rankings/" + item} aria-current={active ? "page" : undefined} className={["inline-flex shrink-0 items-center gap-1 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors", active ? "border-foreground bg-foreground text-background" : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"].join(" ")}>{itemMeta.label}{active ? <ChevronRight className="size-3.5" aria-hidden="true" /> : null}</Link>;
        })}
      </nav>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm">
        <div><span className="font-semibold">Top 100</span><span className="ml-2 text-muted-foreground">Live data loads after the page opens</span></div>
        <Link href="/methodology" className="font-semibold hover:underline">How rankings work</Link>
      </div>
      <RankingPeriodView period={period} scoreLabel={meta.scoreLabel} />
    </div>
  );
}