import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  alternates: { canonical: "/methodology" },
  title: "Methodology",
  description: "How Bobaks Ranking calculates and qualifies rankings.",
};

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Home
      </Link>

      <header>
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Transparency</div>
        <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">How Bobaks rankings work</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Canonical ranking methodology version 2026-09-28. Rankings are produced from Bobaks' collected Roblox public experience data.
        </p>
      </header>

      <Card>
        <CardHeader><CardTitle>Collection</CardTitle></CardHeader>
        <CardContent className="text-sm leading-7 text-muted-foreground">
          The collector runs every 10 minutes. Each collection run has a unique run ID. Successful and partial collection runs count as coverage opportunities, while failed runs do not.
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Live ranking</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
          <p>Live ranking uses the latest qualifying player-count snapshot for each active game.</p>
          <p>The snapshot must be no more than 15 minutes old when the ranking is calculated.</p>
          <p>Score: latest player count.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Weekly ranking</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
          <p>Weekly means the current UTC calendar week, Monday through Sunday.</p>
          <p>Score: arithmetic mean of qualifying player-count snapshots in that week.</p>
          <p>A game needs at least 12 samples and at least 50% coverage.</p>
          <p>Coverage = qualifying game snapshots divided by successful or partial collection runs in the ranking period.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Monthly ranking</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
          <p>Monthly means the current UTC calendar month.</p>
          <p>Score: arithmetic mean of qualifying player-count snapshots in that month.</p>
          <p>A game needs at least 12 samples and at least 50% coverage.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Yearly ranking</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
          <p>Yearly uses exactly 365 UTC calendar dates.</p>
          <p>The current UTC day uses raw snapshots. The previous 364 days use DailyGameStat summaries.</p>
          <p>Score is a weighted average: sum of playerSum divided by sum of totalSamples.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Eligibility and ordering</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
          <p>Only active games are eligible.</p>
          <p>Future snapshots and snapshots linked to failed collection runs are excluded.</p>
          <p>Higher scores rank first. Ties are broken by lower game ID so the result is deterministic.</p>
          <p>Bobaks publishes the top 100 games for every ranking period.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Game activity</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
          <p>A game is not immediately removed when it disappears from discovery.</p>
          <p>After 24 hours without observation, Bobaks starts explicit verification.</p>
          <p>A game is deactivated after 12 consecutive verification misses, about 2 hours at the normal 10-minute cadence. A later successful discovery can reactivate it.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Integrity and limitations</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
          <p>Ranking refreshes are transactional and protected from concurrent refreshes. Before a refresh commits, Bobaks checks row counts, rank continuity, duplicates, score validity, ordering, activity, Live freshness, and period-specific rules.</p>
          <p>If a ranking integrity check fails, the invalid ranking set is not committed. Live refresh also fails closed when the calculated set drops below the configured 50% capacity threshold.</p>
          <p>Bobaks represents collected snapshots, not every moment of gameplay. Rate limits, outages, or discovery gaps can reduce the amount of data collected.</p>
        </CardContent>
      </Card>

      <p className="text-xs leading-5 text-muted-foreground">
        The production API exposes the canonical methodology and audit endpoints. This page is a human-readable explanation for site visitors.
      </p>
    </div>
  );
}
